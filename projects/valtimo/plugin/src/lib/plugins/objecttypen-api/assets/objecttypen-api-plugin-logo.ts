/*
 * Copyright 2015-2020 Ritense BV, the Netherlands.
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

const OBJECTTYPEN_API_PLUGIN_LOGO_BASE64 =
  'data:image/png;base64,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';

export {OBJECTTYPEN_API_PLUGIN_LOGO_BASE64};
