import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'durationToTime'
})
export class DurationToTimePipe implements PipeTransform {
    transform(value: number, durationType: string = "hours", format: string = ""): string {
        switch (durationType.toLowerCase()) {
            default:
                return this.minutesToTime(value);
        }
    }

    private minutesToTime(minutes: number): string {
        let hours = minutes / 60;
        let timeString = hours === 1 ? `${hours} Hr` : `${hours} Hrs`;
        return timeString;
    }
}