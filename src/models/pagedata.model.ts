export class PageData {
    pageContent!: any[];
    pageIndex!: number;
    pageSize!: number;
    total!: number;
    hasPermissions: { [key: string]: boolean; } = {};
}