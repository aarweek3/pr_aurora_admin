import { Routes } from '@angular/router';
import { HelpDocumentationComponent } from './help-documentation/help-documentation.component';
import { ModalHelpComponent } from './modal-help/modal-help.component';
import { SearchHelpComponent } from './search-help/search-help.component';
import { DocumentationHelpComponent } from './documentation-help/documentation-help.component';
import { SidebarHelpComponent } from './sidebar-help/sidebar-help.component';
import { PlatformHelpComponent } from './platform-help/platform-help.component';
import { PaginationHelpComponent } from './pagination-help/pagination-help.component';
import { PathActionsHelpComponent } from './path-actions-help/path-actions-help.component';
import { LanguageAggregatorHelpComponent } from './language-aggregator-help/language-aggregator-help.component';
import { DeveloperHelpComponent } from './developer-help/developer-help.component';
import { MigrationHelpComponent } from './migration-help/migration-help.component';
import { ImageManagementHelpComponent } from './image-management-help/image-management-help.component';
import { TagAggregatorHelpComponent } from './tag-aggregator-help/tag-aggregator-help.component';
import { CategoryTagAggregatorHelpComponent } from './category-tag-aggregator-help/category-tag-aggregator-help.component';
import { CategoryAggregatorHelpComponent } from './category-aggregator-help/category-aggregator-help.component';
import { ProgramOfAggregatorHelpComponent } from './program-of-aggregator-help/program-of-aggregator-help.component';
import { ErrorHandlingHelpComponent } from './error-handling-help/error-handling-help.component';

export const HELP_ROUTES: Routes = [
  {
    path: 'migration',
    component: MigrationHelpComponent,
  },
  {
    path: 'image-management',
    component: ImageManagementHelpComponent,
  },
  {
    path: 'platform-aggregator',
    component: PlatformHelpComponent,
  },
  {
    path: 'language-aggregator',
    component: LanguageAggregatorHelpComponent,
  },
  {
    path: 'developer-aggregator',
    component: DeveloperHelpComponent,
  },
  {
    path: 'tag-aggregator',
    component: TagAggregatorHelpComponent,
  },
  {
    path: 'category-tag-aggregator',
    component: CategoryTagAggregatorHelpComponent,
  },
  {
    path: 'category-aggregator',
    component: CategoryAggregatorHelpComponent,
  },
  {
    path: 'program-aggregator',
    component: ProgramOfAggregatorHelpComponent,
  },
  {
    path: 'documentation-standard',
    component: DocumentationHelpComponent,
  },
  {
    path: 'error-handling',
    component: ErrorHandlingHelpComponent,
  },
  {
    path: 'modal-window',
    component: ModalHelpComponent,
  },
  {
    path: 'search-control',
    component: SearchHelpComponent,
  },
  {
    path: 'pagination',
    component: PaginationHelpComponent,
  },
  {
    path: 'sidebar',
    component: SidebarHelpComponent,
  },
  {
    path: 'sidebar-md',
    component: HelpDocumentationComponent,
    data: {
      title: 'Настройка бокового меню (EasyMDE)',
      fileName: 'боковое меню side-bar основное/боковое меню-md.md',
      editorType: 'markdown',
    },
  },
  {
    path: 'tiny-test',
    component: HelpDocumentationComponent,
    data: {
      title: 'Подключение TinyMCE к проекту',
      fileName: 'tinyMCE/подключение TinyMCE/подключение TinyMCE.html',
      editorType: 'tinymce',
    },
  },
  {
    path: 'tiny-save',
    component: HelpDocumentationComponent,
    data: {
      title: 'Сохранение файлов TinyMCE на диск',
      fileName: 'tinyMCE/tinyMCE сохранение файлов/tinyMCE сохранение файлов.html',
      editorType: 'tinymce',
    },
  },
  {
    path: 'test-sample-multi-lang',
    component: HelpDocumentationComponent,
    data: {
      title: 'Руководство: Sample Multi-Lang',
      fileName: 'sample/Test Sample Multi-Lang.html',
      editorType: 'tinymce',
    },
  },
  {
    path: 'sample-seo-guide',
    component: HelpDocumentationComponent,
    data: {
      title: 'Sample Язык + SEO',
      fileName: 'sample/Образцовая модель Многоязычность + SEO.html',
      editorType: 'tinymce',
    },
  },
  {
    path: 'models-comparison',
    component: HelpDocumentationComponent,
    data: {
      title: 'Сравнение моделей: Basic vs SEO',
      fileName: 'sample/Сравнение базовой и продвинутой SEO-моделей.html',
      editorType: 'tinymce',
    },
  },
  {
    path: 'logger-console',
    component: HelpDocumentationComponent,
    data: {
      title: 'Logger Console 🛠️',
      fileName: 'Logger-console мой/Logger-console мой.html',
      editorType: 'tinymce',
    },
  },
  {
    path: 'buttons-guide',
    component: PathActionsHelpComponent,
  },
  {
    path: 'sample-simple-guide',
    component: HelpDocumentationComponent,
    data: {
      title: 'Simplified Manager ⚡ (Базовый шаблон)',
      fileName: 'sample/sample simple комонент.html',
      editorType: 'tinymce',
    },
  },
];
