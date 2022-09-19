// Core
import { NetlifyCmsCore as CMS } from '../core';
// Backends
import { GitGatewayBackend } from '../backends/git-gateway';
import { TestBackend } from '../backends/test';
import { ProxyBackend } from '../backends/proxy';
// Widgets
import NetlifyCmsWidgetString from '../widgets/string';
import NetlifyCmsWidgetNumber from '../widgets/number';
import NetlifyCmsWidgetText from '../widgets/text';
import NetlifyCmsWidgetImage from '../widgets/image';
import NetlifyCmsWidgetFile from '../widgets/file';
import NetlifyCmsWidgetSelect from '../widgets/select';
import NetlifyCmsWidgetList from '../widgets/list';
import NetlifyCmsWidgetObject from '../widgets/object';
import NetlifyCmsWidgetRelation from '../widgets/relation';
import NetlifyCmsWidgetBoolean from '../widgets/boolean';
import NetlifyCmsWidgetMap from '../widgets/map';
import NetlifyCmsWidgetDatetime from '../widgets/datetime';
import NetlifyCmsWidgetCode from '../widgets/code';
import NetlifyCmsWidgetColorString from '../widgets/colorstring';
// Locales
import * as locales from '../locales';

// Register all the things
CMS.registerBackend('git-gateway', GitGatewayBackend);
CMS.registerBackend('test-repo', TestBackend);
CMS.registerBackend('proxy', ProxyBackend);
CMS.registerWidget([
  NetlifyCmsWidgetString.Widget(),
  NetlifyCmsWidgetNumber.Widget(),
  NetlifyCmsWidgetText.Widget(),
  NetlifyCmsWidgetImage.Widget(),
  NetlifyCmsWidgetFile.Widget(),
  NetlifyCmsWidgetSelect.Widget(),
  NetlifyCmsWidgetList.Widget(),
  NetlifyCmsWidgetObject.Widget(),
  NetlifyCmsWidgetRelation.Widget(),
  NetlifyCmsWidgetBoolean.Widget(),
  NetlifyCmsWidgetMap.Widget(),
  NetlifyCmsWidgetDatetime.Widget(),
  NetlifyCmsWidgetCode.Widget(),
  NetlifyCmsWidgetColorString.Widget(),
] as any[]); // TODO Fix
Object.keys(locales).forEach(locale => {
  CMS.registerLocale(locale, (locales as Record<string, any>)[locale]);
});
