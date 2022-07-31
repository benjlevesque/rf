import fs from 'fs';
import path from 'path';

import { ConfigService } from '~/config/config.service';

const templatePath = path.join(ConfigService.configDir, 'templates');
export const getTemplateTypes = () => {
  if (!fs.existsSync(templatePath)) {
    fs.mkdirSync(templatePath, { recursive: true });
  }
  return fs
    .readdirSync(templatePath, { withFileTypes: true })
    .filter((x) => x.isDirectory())
    .map((x) => x.name);
};

export const getTemplatesByType = (type: string) => {
  return fs
    .readdirSync(path.join(templatePath, type), { withFileTypes: true })
    .filter((x) => x.isFile() && x.name.endsWith('.json'))
    .map((x) => x.name.replace('.json', ''));
};

export const getTemplate = (type: string, template: string) => {
  const filePath = path.join(templatePath, type, `${template}.json`);
  if (!fs.existsSync(filePath)) return;
  return fs
    .readFileSync(path.join(templatePath, type, `${template}.json`))
    .toString();
};

export const copyTemplates = (basePath = '') => {
  for (const fileOrDir of fs.readdirSync(
    path.join(require.main.path, '.templates', basePath),
    { withFileTypes: true },
  )) {
    if (fileOrDir.isDirectory()) {
      if (!fs.existsSync(path.join(templatePath, basePath, fileOrDir.name))) {
        fs.mkdirSync(path.join(templatePath, basePath, fileOrDir.name));
      }
      copyTemplates(path.join(basePath, fileOrDir.name));
    } else if (
      !fs.existsSync(path.join(templatePath, basePath, fileOrDir.name))
    ) {
      fs.copyFileSync(
        path.join(require.main.path, '.templates', basePath, fileOrDir.name),
        path.join(templatePath, basePath, fileOrDir.name),
      );
    }
  }
};
