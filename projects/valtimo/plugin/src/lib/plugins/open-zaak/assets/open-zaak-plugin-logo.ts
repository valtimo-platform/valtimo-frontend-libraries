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

const OPEN_ZAAK_PLUGIN_LOGO_BASE64 =
  'data:image/png;base64,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';

export {OPEN_ZAAK_PLUGIN_LOGO_BASE64};
