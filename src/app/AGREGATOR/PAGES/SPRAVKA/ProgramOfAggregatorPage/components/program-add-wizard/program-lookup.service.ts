import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';

import { CategoryOfAggregatorApiService } from '../../../CategoryOfAggregatorPage/services/category-of-aggregator-api.service';
import { CategorySimplifiedApiService } from '../../../CategorySimplifiedPage/services/category-simplified-api.service';
import { DeveloperOfAggregatorApiService } from '../../../DeveloperOfAggregatorPage/services/developer-of-aggregator-api.service';
import { PlatformOfAggregatorApiService } from '../../../PlatformOfAggregatorPage/services/platform-of-aggregator-api.service';
import { TagOfAggregatorApiService } from '../../../TagOfAggregatorPage/services/tag-of-aggregator-api.service';

import { CategoryOfAggregatorItem } from '../../../CategoryOfAggregatorPage/models/category-of-aggregator.model';
import { DeveloperOfAggregatorItem } from '../../../DeveloperOfAggregatorPage/models/developer-of-aggregator.model';
import { PlatformOfAggregatorItemDto } from '../../../PlatformOfAggregatorPage/models/platform-of-aggregator.model';
import { TagOfAggregatorItem } from '../../../TagOfAggregatorPage/models/tag-of-aggregator.model';
import { CategoryItemDto, SubcategoryItemDto } from '../../../CategorySimplifiedPage/models/category-simplified.model';

export interface ProgramLookupsResult {
  categoryTree: NzTreeNodeOptions[];
  developers: DeveloperOfAggregatorItem[];
  platforms: PlatformOfAggregatorItemDto[];
  tags: TagOfAggregatorItem[];
  simplifiedCategories: CategoryItemDto[];
}

@Injectable({
  providedIn: 'root',
})
export class ProgramLookupService {
  private catApi = inject(CategoryOfAggregatorApiService);
  private devApi = inject(DeveloperOfAggregatorApiService);
  private platApi = inject(PlatformOfAggregatorApiService);
  private tagApi = inject(TagOfAggregatorApiService);
  private catSimplifiedApi = inject(CategorySimplifiedApiService);

  loadAllLookups(): Observable<ProgramLookupsResult> {
    return forkJoin({
      categories: this.catApi.getTree(),
      developers: this.devApi.getPaged({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
      }),
      platforms: this.platApi.getPaged({
        pageNumber: 1,
        pageSize: 100,
        sortBy: 'SortOrder',
        sortDirection: 0,
      }),
      tags: this.tagApi.getPaged({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
      }),
      simplifiedCategories: this.catSimplifiedApi.getPaged({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
      }),
    }).pipe(
      map((res) => ({
        categoryTree: this.mapCategoriesToTree(res.categories),
        developers: res.developers.items,
        platforms: res.platforms.items,
        tags: res.tags.items,
        simplifiedCategories: res.simplifiedCategories.items,
      })),
    );
  }

  loadTags(langId: number | null): Observable<TagOfAggregatorItem[]> {
    return this.tagApi
      .getPaged({
        pageNumber: 1,
        pageSize: 500,
        sortBy: 'SortOrder',
        sortDirection: 0,
        showDeleted: false,
        languageId: langId,
      })
      .pipe(map((res) => res.items));
  }

  getSubcategories(categoryId: number): Observable<SubcategoryItemDto[]> {
    return this.catSimplifiedApi.getSubcategories(categoryId);
  }

  private mapCategoriesToTree(cats: CategoryOfAggregatorItem[]): NzTreeNodeOptions[] {
    return cats.map((c) => ({
      title: c.canonicalName,
      key: c.id.toString(),
      children: c.children ? this.mapCategoriesToTree(c.children) : [],
      isLeaf: !c.children || c.children.length === 0,
    }));
  }
}
