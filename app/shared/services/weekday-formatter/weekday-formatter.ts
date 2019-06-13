import { Injectable } from '@angular/core';
import { CalendarDateFormatter, DateFormatterParams } from 'angular-calendar';

@Injectable()
export class WeekdayFormatterService extends CalendarDateFormatter {

    public monthViewColumnHeader({ date, locale }: DateFormatterParams): string {
        return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date).toUpperCase();
    }

    public weekViewColumnHeader({ date, locale }: DateFormatterParams): string {
        return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date).toUpperCase();
    }
}
