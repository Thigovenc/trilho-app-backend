import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export const getSwaggerSpec = () => {
  // Lê o arquivo YAML
  const swaggerPath = path.join(__dirname, '../docs/swagger.yaml');
  const swaggerFile = fs.readFileSync(swaggerPath, 'utf8');

  // Faz o parse do YAML para objeto JavaScript
  const swaggerSpec = yaml.load(swaggerFile) as any;

  // Atualiza a URL do servidor dinamicamente
  if (swaggerSpec.servers && swaggerSpec.servers[0]) {
    swaggerSpec.servers[0].url = `http://localhost:${process.env.PORT || 5000}`;
  }

  return swaggerSpec;
};
