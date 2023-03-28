/*
 * Copyright 2015-2023 Ritense BV, the Netherlands.
 *
 * Licensed under EUPL, Version 1.2 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://joinup.ec.europa.eu/collection/eupl/eupl-text-eupl-12
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const SMART_DOCUMENTS_PLUGIN_LOGO_BASE64 =
  'data:image/png;base64,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';

export {SMART_DOCUMENTS_PLUGIN_LOGO_BASE64};
