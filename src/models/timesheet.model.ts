import { TimesheetType } from "./timesheet-type.model";
import { Project } from "./project.model";

export class Timesheet {
    id!: string;
    workOn: Date = new Date();
    workMinutes?: number;
    startOn?: Date;
    endOn?: Date;
    shortText!: string;
    released!: boolean;
    releasedOn!: Date | null;
    isOverTime!: boolean;
    employee: any;
    timesheetType: TimesheetType;
    project: Project;
    workItem: any;
    geoLocation: any;
}