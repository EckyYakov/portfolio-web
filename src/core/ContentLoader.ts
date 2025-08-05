import type { Project, BlogPost, ResumeData } from '@/types';

export class ContentLoader {
  private static instance: ContentLoader;
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ContentLoader {
    if (!ContentLoader.instance) {
      ContentLoader.instance = new ContentLoader();
    }
    return ContentLoader.instance;
  }


  async getResume(): Promise<ResumeData | null> {
    const cacheKey = 'resume';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch('/content/resume.json');
      const resume = await response.json();
      this.cache.set(cacheKey, resume);
      return resume;
    } catch (error) {
      console.error('Failed to load resume:', error);
      return null;
    }
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const cacheKey = 'blog-posts';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch('/content/blog/manifest.json');
      const posts = await response.json();
      this.cache.set(cacheKey, posts);
      return posts;
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      return [];
    }
  }

  async getBlogPost(slug: string): Promise<BlogPost | null> {
    const posts = await this.getBlogPosts();
    const post = posts.find(p => p.slug === slug);
    
    if (!post) return null;

    if (!post.content) {
      try {
        const response = await fetch(`/content/blog/posts/${slug}.md`);
        post.content = await response.text();
      } catch (error) {
        console.error(`Failed to load blog post ${slug}:`, error);
      }
    }

    return post;
  }

  clearCache(): void {
    this.cache.clear();
  }
}