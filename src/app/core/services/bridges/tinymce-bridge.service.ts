import { inject, Injectable, NgZone } from '@angular/core';
import { ImageEditorMainComponent } from '@shared/components/av-image-editor-vs/components/image-editor-main/image-editor-main.component';
import { ImageEditorConfig } from '@shared/components/av-image-editor-vs/models/editor-config.model';
import { VSModalRef, VSModalService } from '@shared/components/ui/vs-modal-compromise';

/**
 * Сервис-мост между TinyMCE и Angular-компонентами Aurora.
 * Позволяет открывать редактор изображений и вставлять результат обратно в TinyMCE.
 */
@Injectable({
  providedIn: 'root',
})
export class TinymceBridgeService {
  private readonly vsModal = inject(VSModalService);
  private readonly ngZone = inject(NgZone);

  /**
   * Открывает Aurora Image Studio (VS) и вставляет результат в TinyMCE
   * @param editor Инстанс TinyMCE
   */
  openImageStudio(editor: any): void {
    this.ngZone.run(() => {
      const config: ImageEditorConfig = {
        title: 'Aurora Image Studio (Visual Studio Mode)',
        defaultQuality: 90,
        defaultFormat: 'image/jpeg',
      };

      const modalRef: VSModalRef<ImageEditorConfig> = this.vsModal.open(ImageEditorMainComponent, {
        title: 'Aurora Image Studio',
        data: config,
        width: 1200,
        height: 850,
      });

      modalRef.afterClosed().subscribe((result: any) => {
        if (result && result.isConfirmed && result.htmlSnippet) {
          console.log('[TinymceBridge] Inserting HTML Snippet:', result.htmlSnippet);
          editor.insertContent(result.htmlSnippet);
        }
      });
    });
  }
}
