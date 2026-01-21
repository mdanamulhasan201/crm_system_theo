import axiosClient from "@/lib/axiosClient";

// Get all blogs with pagination and search (for customer view)
export const getAllBlogs = async ({
    search = '',
    page = 1,
    limit = 9
}: {
    search?: string;
    page?: number;
    limit?: number;
} = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (search?.trim()) queryParams.append('search', search.trim());
        queryParams.append('page', page.toString());
        queryParams.append('limit', limit.toString());

        const response = await axiosClient.get(`/blogs/query?${queryParams}`);

        return {
            blogs: response.data.blogs || [],
            total: response.data.pagination?.total || 0,
            currentPage: response.data.pagination?.currentPage || page,
            totalPages: response.data.pagination?.totalPages || 1,
            itemsPerPage: response.data.pagination?.itemsPerPage || limit,
            hasNextPage: response.data.pagination?.hasNextPage || false,
            hasPreviousPage: response.data.pagination?.hasPreviousPage || false
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
        const response = await axiosClient.get(`/blogs/${id}`);
        if (response.data && response.data.success && response.data.blog) {
            const blog = response.data.blog;

            return {
                ...blog,
                tags: typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags || []
            };
        }
        throw new Error('Blog not found');
    } catch (error: any) {
        console.error('Error fetching blog:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch blog');
    }
}
