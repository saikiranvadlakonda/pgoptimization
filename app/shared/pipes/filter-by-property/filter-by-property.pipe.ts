import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'filterByProperty'
})
export class FilterByPropertyPipe implements PipeTransform {

    transform(items: Array<any>, searchText: any, ...properties: string[]) {

        if (Array.isArray(items) && items.length && searchText && searchText.length) {
            return items.filter(item => {
                let isFound: boolean = false;
                properties.forEach((property: any) => {
                    if (property !== '' && item) {
                        property = property.split(".");
                        if (property.length == 1) {
                            if (item[property[0]] && (item[property[0]].toString().toLowerCase().replace(/ /g, '')).includes((searchText.toString().toLowerCase().replace(/ /g, '')))) {
                                isFound = true;
                            }
                        } else {
                            item[property[0]].forEach((subItem: any) => {
                                if (subItem[property[1]] && (subItem[property[1]].toString().toLowerCase().replace(/ /g, '')).includes((searchText.toString().toLowerCase().replace(/ /g, '')))) {
                                    isFound = true;
                                }
                            });
                        }
                    }
                });
                return isFound;
            });
        } else {
            return items;
        }
    }
}