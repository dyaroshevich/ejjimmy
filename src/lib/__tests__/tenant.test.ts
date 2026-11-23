import { scopeTenant, TENANT_COLUMN } from '../tenant';

/**
 * The proxy, exercised against a fake PostgREST builder.
 *
 * The point of these tests is not that Supabase works — it is that the *filter exists* on every verb
 * that can read or write a customer's row, and that a caller cannot choose the tenant by putting one in
 * the payload. Those two properties are what the 190 untouched call sites now rely on.
 */
type Chain = {
  calls: string[];
  table: string;
  result: { data: unknown; error: unknown };
};

function fakeClient(result: { data: unknown; error: unknown } = { data: [], error: null }) {
  const chains: Chain[] = [];

  const builder = (table: string): any => {
    const chain: Chain = { calls: [], table, result };
    chains.push(chain);
    const proxy: any = new Proxy(
      {},
      {
        get(_target, prop: string) {
          if (prop === 'then') {
            return (resolve: any) => resolve(chain.result);
          }
          return (...args: unknown[]) => {
            chain.calls.push(`${prop}(${args.map((a) => JSON.stringify(a)).join(',')})`);
            return proxy;
          };
        },
      }
    );
    return proxy;
  };

  return { client: { from: (table: string) => builder(table) } as any, chains };
}

describe('scopeTenant', () => {
  it('filters a read by the request site', async () => {
    const { client, chains } = fakeClient({ data: [], error: null });
    await scopeTenant(client, 'solar1').from('leads').select('*').eq('status', 'new');

    expect(chains[0].calls[0]).toBe(`select("*")`);
    expect(chains[0].calls[1]).toBe(`eq("${TENANT_COLUMN}","solar1")`);
    // The caller's own condition still applies after ours.
    expect(chains[0].calls[2]).toBe('eq("status","new")');
  });

  it('filters update and delete, not only select', async () => {
    const { client, chains } = fakeClient();
    await scopeTenant(client, 'solar1').from('blog_posts').update({ title: 'x' }).eq('id', 1);
    await scopeTenant(client, 'solar1').from('blog_posts').delete().eq('id', 1);

    expect(chains[0].calls).toEqual([
      'update({"title":"x"})',
      `eq("${TENANT_COLUMN}","solar1")`,
      'eq("id",1)',
    ]);
    expect(chains[1].calls).toEqual(['delete()', `eq("${TENANT_COLUMN}","solar1")`, 'eq("id",1)']);
  });

  it('stamps inserts, and the request site wins over the payload', async () => {
    const { client, chains } = fakeClient();
    const scoped = scopeTenant(client, 'solar1');

    await scoped.from('leads').insert({ name: 'a' });
    await scoped.from('leads').insert([{ name: 'b' }, { name: 'c', site_id: 'ejjimmy' }]);

    expect(chains[0].calls[0]).toBe('insert({"name":"a","site_id":"solar1"})');
    expect(chains[1].calls[0]).toBe(
      'insert([{"name":"b","site_id":"solar1"},{"name":"c","site_id":"solar1"}])'
    );
  });

  it('stamps upserts the same way', async () => {
    const { client, chains } = fakeClient();
    await scopeTenant(client, 'template').from('solar_products').upsert({ id: 'x' }, { onConflict: 'id' });

    expect(chains[0].calls[0]).toContain('"site_id":"template"');
  });

  it('leaves tables that hold no company data alone', async () => {
    const { client, chains } = fakeClient();
    await scopeTenant(client, 'solar1').from('audit_log').select('*');

    expect(chains[0].calls).toEqual(['select("*")']);
  });

  it('names the migration when the column is missing', async () => {
    const { client } = fakeClient({
      data: null,
      error: { message: "column leads.site_id does not exist" },
    });
    const pending = await scopeTenant(client, 'solar1').from('leads').select('*');

    expect(pending.error.message).toContain('tenant scoping is on but the column is missing');
    expect(pending.error.message).toContain('20261120000000_tenant_site_id.sql');
  });

  it('resolves a lazy site per query, not once', async () => {
    const { client, chains } = fakeClient();
    let site = 'solar1';
    const scoped = scopeTenant(client, () => site);

    await scoped.from('leads').select('*');
    site = 'template';
    await scoped.from('leads').select('*');

    expect(chains[0].calls[1]).toBe(`eq("${TENANT_COLUMN}","solar1")`);
    expect(chains[1].calls[1]).toBe(`eq("${TENANT_COLUMN}","template")`);
  });

  it('refuses to scope without a site', () => {
    const { client } = fakeClient();
    expect(() => scopeTenant(client, '')).toThrow(/needs a site id/);
  });
});
