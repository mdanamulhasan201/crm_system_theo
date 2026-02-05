/**
 * S3 Domain Configuration
 * Add S3 domains here or via NEXT_PUBLIC_S3_DOMAINS env variable (comma-separated)
 * This makes it easy to change S3 domains in one place
 */
const getS3Domains = (): string[] => {
  // Get from environment variable if available (comma-separated list)
  const envDomains = process.env.NEXT_PUBLIC_S3_DOMAINS;
  if (envDomains) {
    return envDomains.split(',').map(domain => domain.trim()).filter(Boolean);
  }
  
  // Default S3 domains (fallback if env not set)
  return [
    's3.eu-central-1.amazonaws.com',
    'feetf1rst.s3',
    'amazonaws.com/s3',
    '.s3.'
  ];
};

/**
 * Check if an image URL is from S3 (Amazon S3)
 * S3 images should use unoptimized={true} to avoid Next.js Image Optimization API errors
 * 
 * Configuration: Set NEXT_PUBLIC_S3_DOMAINS in .env file (comma-separated)
 * Example: NEXT_PUBLIC_S3_DOMAINS=s3.eu-central-1.amazonaws.com,feetf1rst.s3,amazonaws.com
 */
export const isS3ImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  
  const s3Domains = getS3Domains();
  
  // Check if URL contains any of the configured S3 domains
  return s3Domains.some(domain => url.includes(domain));
};

/**
 * Get unoptimized flag for Next.js Image component based on URL
 * Returns true for S3 images to avoid 500 errors from Next.js Image Optimization API
 * 
 * Usage: <Image src={imageUrl} unoptimized={shouldUnoptimizeImage(imageUrl)} />
 */
export const shouldUnoptimizeImage = (url: string | null | undefined): boolean => {
  return isS3ImageUrl(url);
};

