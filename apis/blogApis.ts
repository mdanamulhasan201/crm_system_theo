import axiosClient from "@/lib/axiosClient";

// Get all blogs with cursor-based pagination and search (for customer view)
export const getAllBlogs = async ({
    search = '',
    cursor = null,
    limit = 9
}: {
    search?: string;
    cursor?: string | null;
    limit?: number;
} = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (search?.trim()) queryParams.append('search', search.trim());
        if (cursor) queryParams.append('cursor', cursor);
        queryParams.append('limit', limit.toString());

        const response = await axiosClient.get(`/v2/news/get-all?${queryParams}`);

        return {
            blogs: response.data.data || response.data.news || [],
            nextCursor: response.data.nextCursor || null,
            hasMore: response.data.hasMore || false,
            total: response.data.total || 0
        };
    } catch (error: any) {
        console.error('API Error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch blogs';
        throw new Error(errorMessage);
    }
}

// Get blog by ID (for customer view)
export const getBlogById = async (id: string | number) => {
    try {
        const response = await axiosClient.get(`/v2/news/get-details/${id}`);
        if (response.data && (response.data.success || response.data.data)) {
            const blog = response.data.data || response.data.news;

            return {
                ...blog,
                // Map API field names to frontend field names
                completeDescription: blog.fullSubscription || blog.completeDescription,
            };
        }
        throw new Error('Blog not found');
    } catch (error: any) {
        console.error('Error fetching blog:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch blog');
    }
}
