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

const CATALOGI_API_PLUGIN_LOGO_BASE64 =
  'data:image/png;base64,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';

export {CATALOGI_API_PLUGIN_LOGO_BASE64};
