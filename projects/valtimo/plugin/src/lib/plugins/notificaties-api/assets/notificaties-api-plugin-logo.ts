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

const NOTIFICATIES_API_PLUGIN_LOGO_BASE64 =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIxNTAgMTUgOTYgNTAiPjxkZWZzPjxwYXRoIGlkPSJhIiBkPSJNNTcuMzk2LjIxMUguMjgxdjQ5LjQwNWg1Ny4xMTVWLjIxeiIvPjxwYXRoIGlkPSJjIiBkPSJNNTcuNTY0LjIxMUguNDQ4djQ5LjQwNWg1Ny4xMTZWLjIxeiIvPjwvZGVmcz48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE4Ny45MzEgMTUpIj48bWFzayBpZD0iYiIgZmlsbD0iI2ZmZiI+PHVzZSB4bGluazpocmVmPSIjYSIvPjwvbWFzaz48cGF0aCBkPSJNNTcuMzk2IDI0LjkxM2MwLTEzLjU3My0xMS4wMDQtMjQuNjIyLTI0LjU2LTI0LjctLjAyNCAwLS4wNDgtLjAwMy0uMDczLS4wMDNIMjQuNzVhMi41MDQgMi41MDQgMCAxIDAgMCA1LjAxaDcuOTQ1YzEwLjg1OCAwIDE5LjY5NCA4LjgzNCAxOS42OTQgMTkuNjkzIDAgMTAuODYtOC44MzYgMTkuNjk0LTE5LjY5NCAxOS42OTRINS4yODl2LTQuNTc4SC4yODF2OS41ODdoMzIuNDgydi0uMDAxYzEzLjU5LS4wNCAyNC42MzMtMTEuMTA1IDI0LjYzMy0yNC43MDIiIGZpbGw9IiMwMDlGRTQiIG1hc2s9InVybCgjYikiLz48L2c+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTUwIDE1KSI+PG1hc2sgaWQ9ImQiIGZpbGw9IiNmZmYiPjx1c2UgeGxpbms6aHJlZj0iI2MiLz48L21hc2s+PHBhdGggZD0iTS40NDggMjQuOTEzYzAgMTMuNTczIDExLjAwNCAyNC42MjIgMjQuNTYgMjQuNy4wMjQgMCAuMDQ4LjAwMy4wNzMuMDAzaDguMDE0YTIuNTA0IDIuNTA0IDAgMSAwIDAtNS4wMDloLTcuOTQ0Yy0xMC44NTkgMC0xOS42OTQtOC44MzQtMTkuNjk0LTE5LjY5NCAwLTEwLjg1OSA4LjgzNS0xOS42OTQgMTkuNjk0LTE5LjY5NGgyNy40MDR2NC41NzhoNS4wMDlWLjIxSDI1LjA4di4wMDFDMTEuNDkuMjUxLjQ0OCAxMS4zMTYuNDQ4IDI0LjkxMyIgZmlsbD0iIzAwOUZFNCIgbWFzaz0idXJsKCNkKSIvPjwvZz48cGF0aCBmaWxsPSIjMDA0Mzg4IiBkPSJNMTc2LjAxNyA0Mi4xMTZsLTQuNjc4LTEyLjQwMWgtNS42NjRsOC4xNCAyMC4zNjZoMy45MjFsOC40MDEtMjAuMzY2aC01LjM2M3ptMjYuNTQyLjU1OGwtNy45MjgtMTIuOTU5aC02LjQxM3YyMC4zNjdoNC45OTdWMzYuNzg3bDguMTUgMTMuMjk1aDYuMTlWMjkuNzE1aC00Ljk5NnptMTkuMzIzLTQuOTR2NC42NjNoMy41Mzd2Mi42NzdhOS43NzMgOS43NzMgMCAwIDEtMS40MTQuNTRjLS42NTIuMjAzLTEuNDQzLjMwNi0yLjM1NC4zMDYtLjg4IDAtMS42ODYtLjE1LTIuMzk0LS40NDhhNS4zMzggNS4zMzggMCAwIDEtMS44MjQtMS4yNDcgNS41MjIgNS41MjIgMCAwIDEtMS4xNy0xLjg5NGMtLjI3Mi0uNzI5LS40MS0xLjU0OS0uNDEtMi40MzMgMC0uODY3LjEzOC0xLjY4MS40MS0yLjQyYTUuNTAyIDUuNTAyIDAgMCAxIDEuMTctMS45MDggNS4zNzQgNS4zNzQgMCAwIDEgMS44MjQtMS4yNDZjLjcwOS0uMjk4IDEuNTE0LS40NDkgMi4zOTQtLjQ0OSAxLjA2NCAwIDEuOTU5LjE1MSAyLjY1Ny40NDkuNy4yOTcgMS4zMzguNzQgMS44OTggMS4zMThsLjI0Mi4yNDggMy41MTUtMy44MzUtLjIzNy0uMjIxYTguOTIzIDguOTIzIDAgMCAwLTMuNjI3LTIuMDM4Yy0xLjM1LS4zODYtMi44NDctLjU4My00LjQ0OC0uNTgzLTEuNTcyIDAtMy4wNDQuMjUtNC4zNzMuNzQ1YTEwLjEzOSAxMC4xMzkgMCAwIDAtMy40ODEgMi4xNDNjLS45NzUuOTI4LTEuNzQ2IDIuMDY2LTIuMjkgMy4zODQtLjU0MyAxLjMxNS0uODE5IDIuOC0uODE5IDQuNDEzIDAgMS42MTMuMjc2IDMuMDk4LjgyIDQuNDEzLjU0NSAxLjMxOSAxLjMxNCAyLjQ1NyAyLjI4OSAzLjM4NC45NzQuOTI2IDIuMTQ2IDEuNjQ3IDMuNDggMi4xNDMgMS4zMy40OTQgMi44MDIuNzQ0IDQuMzc0Ljc0NCAxLjQ2NCAwIDIuOTItLjE1MiA0LjMzLS40NTJhMTYuMDU0IDE2LjA1NCAwIDAgMCA0LjA5LTEuNDc4bC4xNzctLjA5VjM3LjczM2gtOC4zNjZ6Ii8+PC9nPjwvc3ZnPg==';

export {NOTIFICATIES_API_PLUGIN_LOGO_BASE64};
