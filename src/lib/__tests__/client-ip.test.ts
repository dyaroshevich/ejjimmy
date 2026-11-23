import { clientIp } from '../client-ip';

const headers = (init: Record<string, string>) => new Headers(init);

describe('clientIp', () => {
  it('takes the last hop of x-forwarded-for, not the one the caller wrote', () => {
    // A caller that sends its own header gets it prepended; the edge appends the real peer.
    expect(clientIp(headers({ 'x-forwarded-for': '1.1.1.1, 203.0.113.9' }))).toBe('203.0.113.9');
  });

  it('rotating the spoofed prefix does not change the answer', () => {
    const a = clientIp(headers({ 'x-forwarded-for': '9.9.9.9, 203.0.113.9' }));
    const b = clientIp(headers({ 'x-forwarded-for': '8.8.8.8, 203.0.113.9' }));
    expect(a).toBe(b);
  });

  it('prefers x-real-ip, which the platform sets from the socket', () => {
    expect(
      clientIp(headers({ 'x-real-ip': '198.51.100.7', 'x-forwarded-for': '1.1.1.1, 203.0.113.9' })),
    ).toBe('198.51.100.7');
  });

  it('falls back to the Cloudflare header, then to a single shared bucket', () => {
    expect(clientIp(headers({ 'cf-connecting-ip': '192.0.2.5' }))).toBe('192.0.2.5');
    expect(clientIp(headers({}))).toBe('anonymous');
    expect(clientIp(headers({ 'x-forwarded-for': ' , ' }))).toBe('anonymous');
  });
});
