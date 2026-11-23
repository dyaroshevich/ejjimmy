-- Clean up stale proposal_url values that are relative paths (not real PDF URLs)
-- These were accidentally saved when PDFSpark returned fallback responses
UPDATE leads
SET proposal_url = NULL
WHERE proposal_url IS NOT NULL
  AND proposal_url != '__generating__'
  AND NOT proposal_url LIKE 'http%';
