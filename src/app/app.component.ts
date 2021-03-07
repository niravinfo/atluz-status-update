import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { WorkItemStatus } from '../models/workitem-status.model';
import { WorkItemType } from '../models/workitem-type.model';
import { ResponseData } from '../models/response-data.model';
import { PageData } from '../models/pagedata.model';
import { Timesheet } from '../models/timesheet.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  responseDataText: string;
  timesheetTypes: string[] = [
    'Coding',
    'Review',
    'Investigation',
    'Release',
    'Brainstorming',
    'Testing',
    'Other'
  ];

  formattedTimesheets: WorkItemStatus[];

  constructor(private snackBar: MatSnackBar) { }

  onSubmit() {
    if (this.responseDataText?.trim()) {
      this.parse(this.responseDataText.trim());
    }
  }

  onCopy() {
    let containerId = 'statusId';
    if (document.getElementById(containerId)) {
      var range = document.createRange();
      range.selectNode(document.getElementById(containerId));
      window.getSelection().removeAllRanges(); // clear current selection
      window.getSelection().addRange(range); // to select text
      document.execCommand("copy");
      window.getSelection().removeAllRanges();// to deselect

      this.snackBar.open("Text Copied To Clipboard", null, {
        duration: 2000,
      });
    }
  }

  private parse(data: string) {
    try {
      let responseData = JSON.parse(data) as ResponseData;
      if (responseData) {
        let pageData = responseData.data as PageData;
        if (pageData) {
          let timesheets = pageData.pageContent as Timesheet[];
          this.formatTimesheetData(timesheets);
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  private formatTimesheetData(timesheets: Timesheet[]) {
    try {
      this.formattedTimesheets = [];
      timesheets.forEach(x => {
        let type = x.timesheetType.name;
        let workItemReference = '';
        if (x.shortText && x.shortText.startsWith('#')) {
          const startIndex = x.shortText.indexOf('#');
          const endIndex = x.shortText.indexOf(':');
          if (endIndex !== -1) {
            workItemReference = x.shortText.substring(startIndex + 1, endIndex).match(/\d+/)?.[0];
            x.shortText = x.shortText.substring(endIndex + 1)?.trim();
          }
        }

        let workItemStatus = null;
        if (workItemReference != null && workItemReference.length > 0) {
          // find by work item and type
          workItemStatus = this.formattedTimesheets.find(o => o.workItemReference == workItemReference);
        } else {
          // find by type and text
          workItemStatus = this.formattedTimesheets.find(o => o.description.includes(x.shortText) && o.types.find(n => n.type == type));
        }

        if (workItemStatus) {
          if (!workItemStatus.description) {
            workItemStatus.description = x.shortText;
          }

          let workItemTypeHour = workItemStatus.types.find(n => n.type == type);
          if (workItemTypeHour) {
            workItemTypeHour.workMinutes += x.workMinutes;
          } else {
            workItemTypeHour = new WorkItemType();
            workItemTypeHour.type = type;
            workItemTypeHour.workMinutes = x.workMinutes;
            workItemStatus.types.push(workItemTypeHour);
          }

          workItemStatus.totalMinutes += x.workMinutes;
        } else {
          workItemStatus = new WorkItemStatus();
          workItemStatus.workItemReference = workItemReference;
          workItemStatus.description = x.shortText;
          workItemStatus.totalMinutes += x.workMinutes;
          let workItemTypeHour = new WorkItemType();
          workItemTypeHour.type = type;
          workItemTypeHour.workMinutes = x.workMinutes;
          workItemStatus.types.push(workItemTypeHour);
          this.formattedTimesheets.push(workItemStatus);
        }
      });

      this.formattedTimesheets = this.sortData(this.formattedTimesheets);
    } catch (err) {
      console.log(err);
    }
  }

  // sort the list
  sortData(workItemStatuses: WorkItemStatus[]) {
    workItemStatuses = workItemStatuses.sort((a, b) => {
      let aMinIndex = 100;
      let bMinIndex = 100;

      a.types.forEach(x => {
        const index = this.timesheetTypes.indexOf(x.type);
        if (index != -1 && index < aMinIndex) {
          aMinIndex = index;
        }
      });

      b.types.forEach(x => {
        const index = this.timesheetTypes.indexOf(x.type);
        if (index != -1 && index < bMinIndex) {
          bMinIndex = index;
        }
      });

      if (aMinIndex < bMinIndex) {
        return -1;
      } else if (aMinIndex > bMinIndex) {
        return 1;
      } else {
        return 0;
      }
    });

    return workItemStatuses;
  }
}
