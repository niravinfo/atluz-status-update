import { WorkItemType } from "./workitem-type.model";

export class WorkItemStatus {
    description: string;
    workItemReference: string;
    totalMinutes: number = 0;
    types: WorkItemType[] = [];
}