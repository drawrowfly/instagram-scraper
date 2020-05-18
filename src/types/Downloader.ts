import { PostCollector } from '.';

export interface DownloaderConstructor {
    progress: boolean;
    proxy: string[] | string;
    userAgent: string;
    filepath: string;
    bulk: boolean;
}

export interface ZipValues {
    zip: boolean;
    folder: string;
    collector: PostCollector[];
    fileName: string;
    asyncDownload: number;
}
