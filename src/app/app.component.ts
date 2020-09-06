import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { WorkItemStatus } from '../models/workitem-status.model';
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
        if (workItemReference != null) {
          // find by work item and type
          workItemStatus = this.formattedTimesheets.find(o => o.workItemReference == workItemReference && o.type == type);
        } else {
          // find by type and text
          workItemStatus = this.formattedTimesheets.find(o => o.type == type && o.description.includes(x.shortText));
        }

        if (workItemStatus) {
          if (!workItemStatus.description) {
            workItemStatus.description = x.shortText;
          }

          workItemStatus.workMinutes += x.workMinutes;
        } else {
          workItemStatus = new WorkItemStatus();
          workItemStatus.type = type;
          workItemStatus.workItemReference = workItemReference;
          workItemStatus.description = x.shortText;
          workItemStatus.workMinutes = x.workMinutes;
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
      return this.timesheetTypes.indexOf(a.type) - this.timesheetTypes.indexOf(b.type);
    });

    return workItemStatuses;
  }
}
