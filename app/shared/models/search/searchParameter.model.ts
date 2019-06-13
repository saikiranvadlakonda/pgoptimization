export class SearchParameters {
    public Filters: string = null;
    public PageNumber: number = 0;
    public QueryString: string = null;
    public Size: number = 10;
    public Sort: boolean = false;
    public SearchTerm: string = null;
    public SearchPreFilters: string = null; 
    public NarrowSearchTerms: string = "";
    public OriginalNarrowSearchTerm: string = "";
}


export class searchedParameters {
  public filters: string = null;
  public pageNumber: number = 0;
  public queryString: string = null;
  public size: number = 10;
  public sort: boolean = false;
  public searchTerm: string = null;
  public searchPreFilters: string = null;
  public narrowSearchTerms: string = "";
  public originalNarrowSearchTerm: string = "";
}
