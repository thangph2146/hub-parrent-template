/**

 * Đường dẫn artifact pipeline (meta JSON) dưới root mỗi API app.

 */

const path = require("node:path");



const PIPELINE_DIR = ".pipeline";

const PACKAGE_TEMPLATES_META = "PACKAGE_MODULE_TEMPLATES.meta.json";



function pipelineDir(apiRoot) {

  return path.join(apiRoot, PIPELINE_DIR);

}



function packageTemplatesMetaPath(apiRoot) {

  return path.join(pipelineDir(apiRoot), PACKAGE_TEMPLATES_META);

}



/** API lines commit .pipeline (source + template). Deploy line khác: gitignore. */

const COMMITTED_PIPELINE_API_ROOTS = [

  "apps/main/api",

  "packages/api-server/deploy/nest",

];



module.exports = {

  PIPELINE_DIR,

  PACKAGE_TEMPLATES_META,

  pipelineDir,

  packageTemplatesMetaPath,

  COMMITTED_PIPELINE_API_ROOTS,

};

