/* eslint-disable no-param-reassign */
/* eslint-disable consistent-return */
import request from 'request';
import { Agent } from 'http';
import { createWriteStream } from 'fs';
import archiver from 'archiver';
import { SocksProxyAgent } from 'socks-proxy-agent';
import { forEachLimit } from 'async';

import { MultipleBar } from '../helpers';
import { DownloaderConstructor, PostCollector, ZipValues, Proxy } from '../types';

export class Downloader {
    public progress: boolean;

    public mbars: MultipleBar;

    public progressBar: any[];

    private proxy: string[] | string;

    public userAgent: string;

    public filepath: string;

    public bulk: boolean;

    constructor({ progress, proxy, userAgent, filepath, bulk }: DownloaderConstructor) {
        this.progress = true || progress;
        this.progressBar = [];
        this.userAgent = userAgent;
        this.filepath = filepath;
        this.mbars = new MultipleBar();
        this.proxy = proxy;
        this.bulk = bulk;
    }

    /**
     * Get proxy
     */
    private get getProxy(): Proxy {
        if (Array.isArray(this.proxy)) {
            const selectProxy = this.proxy.length ? this.proxy[Math.floor(Math.random() * this.proxy.length)] : '';
            return {
                socks: false,
                proxy: selectProxy,
            };
        }
        if (this.proxy.indexOf('socks4://') > -1 || this.proxy.indexOf('socks5://') > -1) {
            return {
                socks: true,
                proxy: new SocksProxyAgent(this.proxy as string),
            };
        }
        return {
            socks: false,
            proxy: this.proxy as string,
        };
    }

    /**
     * Add new bard to indicate download progress
     * @param {number} len
     */
    public addBar(len: number): any[] {
        this.progressBar.push(
            this.mbars.newBar('Downloading :id [:bar] :percent', {
                complete: '=',
                incomplete: ' ',
                width: 30,
                total: len,
            }),
        );

        return this.progressBar[this.progressBar.length - 1];
    }

    /**
     * Convert video file to a buffer
     * @param {*} item
     */
    public toBuffer(item: PostCollector): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const proxy = this.getProxy;
            let r = request;
            let barIndex;
            let buffer = Buffer.from('');
            if (proxy.proxy && !proxy.socks) {
                r = request.defaults({ proxy: `http://${proxy.proxy}/` });
            }
            if (proxy.proxy && proxy.socks) {
                r = request.defaults({ agent: proxy.proxy as Agent });
            }
            r.get({
                url: item.is_video ? item.video_url! : item.display_url!,
                headers: {
                    'user-agent': this.userAgent,
                },
            })
                .on('response', (response) => {
                    if (this.progress && !this.bulk) {
                        barIndex = this.addBar(parseInt(response.headers['content-length'] as string, 10));
                    }
                })
                .on('data', (chunk) => {
                    buffer = Buffer.concat([buffer, chunk as Buffer]);
                    if (this.progress && !this.bulk) {
                        barIndex.tick(chunk.length, { id: item.id });
                    }
                })
                .on('end', () => {
                    resolve(buffer);
                })
                .on('error', () => {
                    reject(new Error(`Cant download video: ${item.id}. If you were using proxy, please try without it.`));
                });
        });
    }

    /**
     * Download and ZIP video files
     */
    public zipIt({ collector, filepath, fileName, asyncDownload }: ZipValues) {
        return new Promise((resolve, reject) => {
            const zip = filepath ? `${filepath}/${fileName}.zip` : `${fileName}.zip`;
            const output = createWriteStream(zip);
            const archive = archiver('zip', {
                gzip: true,
                zlib: { level: 9 },
            });
            archive.pipe(output);

            forEachLimit(
                collector,
                asyncDownload,
                (item: PostCollector, cb) => {
                    this.toBuffer(item)
                        .then((buffer) => {
                            item.downloaded = true;
                            if (item.is_video) {
                                archive.append(buffer, { name: `${item.shortcode}.mp4` });
                            } else {
                                archive.append(buffer, { name: `${item.shortcode}.jpeg` });
                            }
                            cb(null);
                        })
                        .catch(() => {
                            item.downloaded = false;
                            cb(null);
                        });
                },
                (error) => {
                    if (error) {
                        return reject(error);
                    }

                    archive.finalize();
                    archive.on('end', () => resolve());
                },
            );
        });
    }
}
