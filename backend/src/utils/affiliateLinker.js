const appendAmazonTag = (url, tag) => {
  if (!url || !tag) return url;
  
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('amazon')) {
      parsed.searchParams.set('tag', tag);
      return parsed.toString();
    }
  } catch (error) {
    // If it's not a valid URL or fails to parse, return original
    return url;
  }
  return url;
};

module.exports = { appendAmazonTag };
