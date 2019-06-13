import { SearchQueryTransformEntryModel } from './searchQueryTransformEntry.model';
import { SearchResultSetModel } from './searchResultSet.model';
import { SearchPageModel } from './searchPage.model';
import { NavigationModel } from './navigation.model';
import { SearchResultModel } from './searchResult.model';
import { NavigationEntryModel } from './navigationEntry.model';
import { NavigationElementModel } from './navigationElement.model';
import { searchedParameters } from './searchParameter.model';

export class SearchModel {
  public didYouMean: SearchQueryTransformEntryModel[];
  public spellCheckedWords: string;
  public didYouMeanQuery: string;
  public resultSet: SearchResultSetModel;
  public nextPage: SearchPageModel;
  public prevPage: SearchPageModel;
  public errorResults: string[];
  public navigation: NavigationModel;
  public searchResults: SearchResultModel[];
  public navigationEntries: NavigationEntryModel[];
  public navigationElements: NavigationElementModel[];
  public searchedParameters: searchedParameters;
  public searchCorrelationId: string;
}
