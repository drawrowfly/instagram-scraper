export interface Main<Key extends string, I> {
    config: {
        csrf_token: string;
    };
    graphql: {
        [key in Key]: GraphQl<I>[];
    };
}

export interface GraphQl<T> {
    graphql: T;
}

export interface GraphQlResponse<T> {
    data: T;
}

export interface UserMetaFromWebApi {
    graphql: User;
}

export interface PostMetaFromWebApi {
    graphql: {
        shortcode_media: PostMeta;
    };
}

export interface UserReelsFeed {
    items: {
        media: {
            taken_at: number;
            pk: string;
            id: string;
            device_timestamp: number;
            media_type: number;
        };
    }[];
    paging_info: {
        max_id: string;
        more_available: boolean;
    };
    status: string;
}

export interface UserStories {
    reels_media: {
        id: number;
        latest_reel_media: number;
        expiring_at: number;
        items: {
            taken_at: number;
            media_type: number;
        }[];
    }[];
    status: string;
}

export interface User {
    user: {
        biography: string;
        id: string;
        edge_owner_to_timeline_media: Edges;
        edge_followed_by: Edges;
        edge_follow: Edges;
        external_url: string;
        full_name: string;
        business_category_name: string;
        category_id: string;
        overall_category_name: string;
        is_private: boolean;
        is_verified: boolean;
        profile_pic_url: string;
        profile_pic_url_hd: string;
        username: string;
    };
}

export interface Location {
    location: {
        name: string;
        id: string;
        has_public_page: string;
        lat: number;
        lng: number;
        blurb: string;
        website: string;
        profile_pic_url: string;
        edge_location_to_media: Edges;
    };
}

export interface Hashtag {
    hashtag: {
        description: string;
        id: string;
        name: string;
        edge_hashtag_to_media: Edges;
    };
}

export interface Comments {
    shortcode_media: {
        shortcode: string;
        id: string;
        edge_media_to_parent_comment: Edges;
    };
}

export interface Likers {
    shortcode_media: {
        shortcode: string;
        id: string;
        edge_liked_by: Edges;
    };
}

export interface Edges {
    count: number;
    page_info: {
        has_next_page: boolean;
        end_cursor: string;
    };
    edges: Post[];
}

export type PostType = 'GraphSidecar' | 'GraphVideo' | 'GraphImage';

export interface Post {
    node: PostMeta;
}

export interface CommentsMeta {
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
    edge_liked_by: {
        count: number;
    };
    edge_threaded_comments: {
        count: number;
    };
}

export interface PostMeta {
    __typename: PostType;
    id: string;
    shortcode: string;
    dimensions: { height: number; width: number };
    display_url: string;
    gating_info: string;
    video_url: string;
    video_duration: number;
    edge_media_to_tagged_user: {
        edges: {
            node: {
                user: { full_name: string; id: number; is_verified: boolean; profile_pic_url: string; username: string };
                x: number;
                y: number;
            };
        }[];
    };
    caption_is_edited: boolean;
    has_ranked_comments: boolean;
    fact_check_overall_rating: string;
    fact_check_information: string;
    media_preview: string;
    owner: { id: string; username: string; is_verified: boolean; profile_pic_url: string };
    is_video: boolean;
    accessibility_caption: string;
    edge_media_to_caption: {
        edges: { node: { text: string } }[];
    };
    edge_media_to_comment: { count: number };
    comments_disabled: boolean;
    taken_at_timestamp: number;
    edge_liked_by: { count: number };
    edge_media_preview_like: { count: number };
    location: { id: string; has_public_page: boolean; name: string; slug: string };
    thumbnail_src: string;
    thumbnail_resources: { src: string; config_width: number; config_height: number }[];
    felix_profile_grid_crop: string;
    video_view_count: number;
    text: string;
    created_at: number;
    did_report_as_spam: boolean;
    edge_threaded_comments: { count: number };
    profile_pic_url: string;
    full_name: string;
    is_verified: boolean;
    is_private: boolean;
    username: string;
}
