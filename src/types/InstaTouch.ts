import { SocksProxyAgent } from 'socks-proxy-agent';
import { Edges } from 'types/Ig';

export type ScrapeType = 'user' | 'hashtag' | 'location' | 'comments' | 'likers' | 'followers' | 'following' | 'user_meta' | 'post_meta';

export type MediaType = 'image' | 'video' | 'all';

export interface Proxy {
    socks: boolean;
    proxy: string | SocksProxyAgent;
}

export interface Constructor {
    download: boolean;
    filepath: string;
    filetype: string;
    proxy: string[] | string;
    session: string[] | string;
    asyncDownload: number;
    cli: boolean;
    progress?: boolean;
    bulk?: boolean;
    input: string;
    count: number;
    zip?: boolean;
    scrapeType: ScrapeType;
    by_user_id?: boolean;
    store_history?: boolean;
    userAgent: string;
    test?: boolean;
    noWaterMark?: boolean;
    fileName?: string;
    sessionId?: string[];
    mediaType: string;
    queryHash: string;
    id: string;
    filename?: string;
    url: string;
    timeout: number;
    endCursor?: string;
    historyPath?: string;
    originalBehaivor?: boolean;
}

export interface Options {
    timeout?: number;
    proxyFile?: string;
    proxy?: string[] | string;
    session?: string[] | string;
    mediaType?: MediaType;
    download?: boolean;
    asyncDownload?: number;
    filepath?: string;
    filetype?: string;
    progress?: boolean;
    count?: number;
    userAgent?: string;
    remove?: string;
    filename?: string;
    endCursor?: string;
    historyPath?: string;
    asyncBulk?: number;
    bulk?: boolean;
    originalBehaivor?: boolean;
}

export interface PostCollector {
    id: string;
    shortcode?: string;
    type?: string;
    is_video?: boolean;
    dimension?: { height: number; width: number };
    display_url?: string;
    thumbnail_src?: string;
    video_url?: string;
    owner?: { id: string; username: string };
    description?: string;
    comments?: number;
    likes?: number;
    views?: number;
    comments_disabled?: boolean;
    taken_at_timestamp?: number;
    location?: { id: string; has_public_page: boolean; name: string; slug: string };
    hashtags?: string[];
    mentions?: string[];
    text?: string;
    created_at?: number;
    did_report_as_spam?: boolean;
    is_private?: boolean;
    is_verified?: boolean;
    username?: string;
    full_name?: string;
    profile_pic_url?: string;
    downloaded?: boolean;
    repeated?: boolean;
}

export interface CommentCollector {
    id: string;
    text: string;
    created_at: number;
    did_report_as_spam: boolean;
    owner: {
        id: number;
        is_verified: boolean;
        profile_pic_url: string;
        username: string;
    };
    likes: number;
    comments: number;
}
export interface Result {
    collector: PostCollector[];
    original: Edges;
    zip?: string;
    json?: string;
    csv?: string;
}
