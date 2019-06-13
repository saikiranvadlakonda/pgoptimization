import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(items: Array<any>, searchText: any) {

        if (Array.isArray(items) && items.length && searchText && searchText.length) {
            return items.filter(item => {
                let keys = Object.keys(item);
                if (Array.isArray(keys) && keys.length) {
                    for (let key of keys) {
                        if (item.hasOwnProperty(key) && item[key] && item[key].length && (item[key].toString().toLowerCase().replace(/ /g, '')).includes((searchText.toString().toLowerCase().replace(/ /g, '')))) {
                            return true;
                        }
                    }
                    return false;
                } else {
                    return false;
                }
            });
        } else {
            return items;
        }
    }
}