/*
 * Copyright 2015-2024 Ritense BV, the Netherlands.
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
  'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyBpZD0iTGF5ZXJfMiIgZGF0YS1uYW1lPSJMYXllciAyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNjcuNzIgMTA2LjU1Ij4KICA8ZGVmcz4KICAgIDxzdHlsZT4KICAgICAgLmNscy0xIHsKICAgICAgICBmaWxsOiAjMDE5ZWUwOwogICAgICB9CgogICAgICAuY2xzLTIgewogICAgICAgIGZpbGw6ICNiYjhkYmM7CiAgICAgIH0KCiAgICAgIC5jbHMtMyB7CiAgICAgICAgZmlsbDogI2JmZTZmNzsKICAgICAgfQoKICAgICAgLmNscy00IHsKICAgICAgICBmaWxsOiAjYzU5ZGM3OwogICAgICB9CgogICAgICAuY2xzLTUgewogICAgICAgIGZpbGw6ICNjY2E5Y2U7CiAgICAgIH0KCiAgICAgIC5jbHMtNiB7CiAgICAgICAgZmlsbDogIzliNTY5ZDsKICAgICAgfQoKICAgICAgLmNscy03IHsKICAgICAgICBmaWxsOiAjN2ZjZWVmOwogICAgICB9CgogICAgICAuY2xzLTggewogICAgICAgIGZpbGw6ICM1OWMwZWE7CiAgICAgIH0KCiAgICAgIC5jbHMtOSB7CiAgICAgICAgZmlsbDogIzc5MWM3ZDsKICAgICAgfQogICAgPC9zdHlsZT4KICA8L2RlZnM+CiAgPGcgaWQ9IkxheWVyXzEtMiIgZGF0YS1uYW1lPSJMYXllciAxIj4KICAgIDxnPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0yOC44MywyMi42NGMtLjA3LjM5LS4wOC44LS4yMSwxLjE4LS4zNC45OS0uMzIsMS45OS0uMDYsMi45NS44NywzLjE0LDIuNDUsNS44Nyw0Ljg5LDguMDguODcuNzksMS44NywxLjM5LDMuMDQsMS42LDEuODQuMzMsMy4yNy0uNDcsNC40Ny0xLjc3LDEuMzctMS40OSwyLjI3LTMuMjcsMy4wMS01LjEzLDEuMjgtMy4yLDIuMjUtNi40OCwyLjI2LTkuOTYsMC0xLjY5LS40OS0zLjE0LTEuNjctNC40Ni0yLjM1LTIuNjItMi45MS01Ljc1LTEuNzctOS4wNCwxLjE4LTMuNDIsMy43MS01LjQ4LDcuMjgtNS45OCw1LjIyLS43Myw5LjI5LDIuNzksMTAuMjIsNy4xOC45NSw0LjUtMS44LDkuMjUtNi4yNiwxMC40OC0xLjcuNDctMi44OSwxLjQ2LTMuODMsMi44NS0xLjgyLDIuNjktMi43NCw1Ljc0LTMuNDYsOC44Ni0uNiwyLjY1LS45OSw1LjMyLS41Myw4LjA2LjY3LDQuMDMsMy4zNSw1Ljc3LDcuMTQsNS4zLDEuMjgtLjE2LDIuNTEtLjQ4LDMuNjMtMS4xMywxLjM2LS43OCwyLjE5LTEuOTMsMi40Ni0zLjQ5LDEuMTItNi40NSw2LjYtMTEuNTksMTMuMS0xMi41OCw3LjgzLTEuMiwxNS43NywzLjgzLDE3LjY5LDEyLjA5LDEuOTksOC41NC0zLjc5LDE3LjM5LTEyLjQyLDE4LjktNi44NCwxLjItMTMuMjctMS43NS0xNi42NC03Ljc2LS45OS0xLjc2LTIuMzctMi43Ni00LjI3LTMuMTItMS44Mi0uMzQtMy42Ny0uMzUtNS40NC4yNi0zLjA0LDEuMDMtNC43OCwzLjI1LTUuNDUsNi4zLS43NCwzLjM5LS4yNyw2Ljc0LjU1LDEwLjA2LjI5LDEuMi42MiwyLjM5LDEuMjEsMy40OSwxLjY5LDMuMTcsNC4yOSw1LjAyLDcuODYsNS42MSw3LjU3LDEuMjQsMTMuNTMsNy4zMSwxNC41MywxNC44NywxLjM1LDEwLjIzLTUuNjIsMTguNzgtMTUuMDUsMjAuMDYtMTAuNzcsMS40Ni0xOC42OC02LjIzLTE5Ljk0LTE0LjQ4LTEuMDMtNi43OSwxLjA2LTEyLjQ0LDYuMzQtMTYuODQsMS45NS0xLjYzLDIuOTMtMy43OCwyLjk1LTYuMTguMDQtNS4yNi0xLjQyLTEwLjE3LTQuNDMtMTQuNTItMi4wMS0yLjkxLTUuMDYtNC4xNC04LjQ0LTQuNjktMS43LS4yOC0zLjQzLS4zNS01LjE0LS4yMy0yLjIyLjE1LTQuNjEuOTMtNS40NCwzLjk3LTEuMDcsMy45NC01LjIzLDcuOS0xMS41Nyw3LjI5LTQuNDgtLjQzLTguNDktNC4xOS05LjMtOC44NS0uODEtNC42OSwxLjQxLTkuMjksNS41NC0xMS40OSw0LjExLTIuMTksOS4yMi0xLjQ4LDEyLjY1LDEuNzcuNjcuNjMsMS4yNywxLjM0LDEuNzEsMi4xNS43NCwxLjM4LDEuOTMsMi4xLDMuNDEsMi4zNywzLjA1LjU2LDUuNzgtLjQsNy4xOC0yLjYzLjk4LTEuNTYsMS4wOS0zLjI2LjY1LTQuOTYtLjc5LTMuMDQtMi4zOC01LjY2LTQuNjctNy44LTEuMzktMS4zLTMuMDQtMS45Mi01LjAzLTEuNzYtMy4wMi4yNC01LjUtLjkyLTcuMTktMy40NC0xLjc0LTIuNi0xLjg2LTUuNDItLjQxLTguMTcsMS40MS0yLjY4LDMuNzMtNCw2Ljc4LTQuMTksMy45Ny0uMjQsOC41MywzLjE5LDguMTMsOC42My0uMTIuMDktLjE2LjItLjA5LjMzWm0xMC4zNiw2Ni4xMWMtLjE4LDguMiw2Ljk5LDEzLjc2LDEzLjI1LDEzLjY2LDcuNjctLjEzLDEzLjQtNS44NCwxMy41MS0xMy40OS4xMS03LjY2LTYuMjgtMTMuODMtMTMuMjktMTMuODItOC45NC4wMS0xMy44Niw3LjczLTEzLjQ4LDEzLjY2WiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTkiIGQ9Im0xNDAuNTEsMzEuMjFjMS45OC0yLjM5LDQuNC00LjA1LDcuNTQtNC40NCw0LjcyLS41OSw4LjgxLjQ3LDExLjY4LDQuNi4wNy4xLjE2LjE4LjMuMzQuNC0uNDMuOC0uODUsMS4xOS0xLjI3LDIuODgtMy4wNCw2LjQ3LTQuMDYsMTAuNTUtMy42OSwxLjkzLjE4LDMuNzYuNjcsNS40MSwxLjczLDMuMDIsMS45NCw0LjQxLDQuODMsNC43Nyw4LjMuMS45OS4wNiwxLjk5LjA2LDIuOTksMCw2LjM1LDAsMTIuNywwLDE5LjA1LDAsLjQ0LjAxLjg4LS4wMywxLjMyLS4zMywzLjQ5LTIuNDEsNC40MS01LjA3LDQuMjgtMi42NC0uMTMtNC4wNy0xLjYzLTQuMzItNC4yMy0uMDktLjg4LS4xMi0xLjc1LS4xMi0yLjYzLDAtNS41OSwwLTExLjE4LDAtMTYuNzcsMC0uNTIsMC0xLjA0LS4wNy0xLjU1LS4yNC0yLjA2LTEuNTItMy41Mi0zLjUzLTQuMDQtMy43NS0uOTctNi45NSwxLjEyLTcuNTYsNC45My0uMTEuNzEtLjE3LDEuNDItLjE3LDIuMTQsMCw1LjQ3LDAsMTAuOTQsMCwxNi40MSwwLC43Ni0uMDIsMS41MS0uMTcsMi4yNi0uNTgsMi43NS0yLjUsMy42NC00LjkzLDMuNDUtMi44OC0uMjItNC4yNC0xLjY2LTQuMjctNC41Ny0uMDctNi4xMS0uMDQtMTIuMjItLjA0LTE4LjMzLDAtLjY4LDAtMS4zNS0uMS0yLjAzLS40MS0yLjg3LTIuMTEtNC4zOS01LTQuNDMtLjI4LDAtLjU2LjAzLS44NC4wNC0uMTMtLjA2LS4yMy0uMDQtLjMzLjA3LTMuNDYuNDktNC45MiwzLjQzLTQuOTYsNi4yMy0uMDUsMi45NS0uMDEsNS45LS4wMSw4Ljg2LDAsMi45MSwwLDUuODMsMCw4Ljc0LDAsLjYtLjA2LDEuMTktLjE2LDEuNzgtLjM5LDIuNDUtMi4wOSwzLjk0LTUuMTIsMy42NC0yLjY4LS4yNi0zLjc2LTEuNC00LjE2LTQuMDgtLjA2LS40My0uMTItLjg3LS4xMi0xLjMxLDAtOS4wMiwwLTE4LjAzLDAtMjcuMDUuMTEtLjA4LjE3LS4xOC4wNi0uMy4xNi0xLjA3LjQtMi4wOCwxLjA3LTIuOTksMS40NS0xLjk3LDYuNDItMi4xOSw3LjU5LDEuMTQuMTYuNDUuMzMuODkuMzksMS4zNy0uMDQuMTYtLjAzLjMuMTEuNDEuMjItLjAyLjMzLS4xNS4zNS0uMzZaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtOSIgZD0ibTIwNy4zMyw1OS44NGMtMi43NiwzLjctNi41Nyw1LjIxLTExLjA3LDUuMjQtLjM2LDAtLjcyLDAtMS4wNywwbC0uMjgtLjA0Yy0yLjA3LS4xMS00LjAyLS42NC01LjczLTEuODUtMi4wMy0xLjQzLTMuMTctMy40My0zLjcxLTUuODEtLjUzLTIuMzctLjUyLTQuNzUuMDItNy4xMi41OS0yLjU2LDIuMDUtNC40NSw0LjMzLTUuNzQsMi4yNi0xLjI4LDQuNzQtMS44OCw3LjI2LTIuMywyLjI0LS4zNyw0LjUtLjY0LDYuNzUtLjk2LjMxLS4wNC42My0uMTEuOTQtLjE4LDEuNzgtLjQsMi4yNi0uODYsMi40My0yLjMxLjIyLTEuOTUtLjM2LTMuMjYtMS43Ny0zLjk2LTIuODctMS40Mi03LjY5LS42MS05Ljk1LDEuNjctLjY1LjY1LTEuMjUsMS4zNi0xLjk0LDEuOTUtMi40LDIuMDgtNS44OCwxLjE5LTYuNjYtMS43LS4zOS0xLjQ2LS4wNS0yLjg1LjcxLTQuMTMsMS4xMS0xLjg5LDIuNzktMy4xNiw0LjcyLTQuMTEsMi40Ny0xLjIyLDUuMS0xLjgsNy44NS0xLjg2LDMuMjUtLjA3LDYuNDcuMTMsOS41NywxLjE5LDIuMDMuNywzLjg1LDEuNzMsNS4yLDMuNDYsMS4zNSwxLjczLDEuNzQsMy43MywxLjczLDUuODUtLjAyLDYuNTUtLjAzLDEzLjEtLjA1LDE5LjY1LDAsLjI0LjAzLjQ4LjA0LjcyLS4wOS4xMy0uMDUuMjMuMDYuMzIuMDksMS4yNy4yNSwyLjU0LjI3LDMuODEuMDIsMS41NC0uODEsMi43LTIuMjcsMy4xNi0xLjY1LjUyLTMuMzIuNDYtNC44OC0uMzMtMS4zNy0uNjktMS44OC0xLjk5LTIuMTQtMy40MS0uMDYtLjM1LS4wNi0uNzEtLjA5LTEuMDcsMC0uMDcuMDMtLjE2LDAtLjItLjA5LS4xLS4xOC0uMDMtLjI1LjA2Wm0uMDktMTMuNjJjLTIuNjcsMS4yMy01LjM3LDEuNzItOC4wNiwyLjI4LS45Ny4yLTEuOTIuNTQtMi44LDEuMDMtMS43NC45Ni0yLjM5LDIuNDEtMi4xMyw0LjY3LjE4LDEuNTcsMS4zMywyLjkxLDMuMDgsMy4yNiw0LjU3LjkyLDguNjgtMS4zLDkuNjYtNS43Ny4zOC0xLjc0LjE0LTMuNS4yNC01LjQ3WiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTkiIGQ9Im0xMTEuNjMsNjUuMDJjLTMuODUuMDQtNy4yOS0uNTEtMTAuNDctMi4yLTEuNjUtLjg3LTMuMDYtMi4wMi00LjAzLTMuNjUtLjgyLTEuMzctMS4wNi0yLjg2LS42Ny00LjM4Ljc1LTIuODgsNC40Ni0zLjk4LDYuOTEtMi4wNi42Mi40OSwxLjIyLDEuMDUsMS43LDEuNjgsMi43LDMuNTUsNy42NiwzLjQ5LDEwLjc0LDIuNTMsMS41Ny0uNDksMi4zNi0xLjU2LDIuNDEtMi45My4wNS0xLjE3LS40My0xLjk5LTEuNTEtMi40Ny0xLjU4LS42OS0zLjI3LTEuMDEtNC45My0xLjQxLTIuNjMtLjY0LTUuMjktMS4xNy03LjgzLTIuMTUtMS44Ny0uNzItMy42NS0xLjU5LTUuMTItMy4wMS0xLjU3LTEuNTItMi4zNi0zLjQtMi40Ni01LjU1LS4yOC01Ljg0LDIuNjMtMTAuMDksOC4yNC0xMS44NCw1LjAxLTEuNTYsMTAuMDEtMS4zMiwxNC45LjUzLDEuNzMuNjYsMy4yOCwxLjY0LDQuNDQsMy4xNS4xLjEzLjIuMjUuMjkuMzgsMS4yNCwxLjgzLDEuMTksNC4wMS0uMTEsNS40My0xLjI2LDEuMzgtMy41MywxLjYtNS40MS41Mi0uOTctLjU2LTEuOC0xLjMzLTIuNzEtMS45Ny0yLjU5LTEuODItNS40MS0xLjk5LTguMzMtMS4wMS0uODYuMjktMS40OC45Mi0xLjc1LDEuODQtLjM4LDEuMzEtLjA1LDIuMjYsMS4xMywyLjk1LDEuMDQuNjEsMi4yMi44OCwzLjM4LDEuMTcsMi45NC43Myw1LjkzLDEuMjQsOC44MywyLjEzLDEuMjYuMzksMi40OS44NSwzLjY2LDEuNDYsMi44MSwxLjQ1LDQuNjMsMy42NCw0Ljk1LDYuODcuNDgsNC45LTEuMTQsOS41OC02LjE4LDEyLjAxLTEuNDEuNjgtMi44OSwxLjE2LTQuNDEsMS40Ni0xLjk2LjM4LTMuOTUuNTktNS42Ni41NFoiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy05IiBkPSJtMjU5Ljk2LDM0Ljg1YzAsNi40MywwLDEyLjg2LDAsMTkuMjgsMCwuMjgsMCwuNTYuMDQuODQuMTgsMS4zMi41MSwxLjYyLDEuODEsMS43Ny45OS4xMSwxLjk5LjA4LDIuOTcuMywxLjM1LjI5LDIuMDgsMS4wNiwyLjI4LDIuNDIuMzEsMi4xMS0uNzksMy45Mi0yLjg2LDQuNTEtMS40Ni40Mi0yLjk4LjU1LTQuNS40NC0xLjE1LS4wOC0yLjMtLjExLTMuNDUtLjM0LTMuMzktLjY4LTUuMjItMi41OC01LjY4LTYuMDQtLjE3LTEuMy0uMjctMi42MS0uMjctMy45NC4wMS01Ljk5LDAtMTEuOTgsMC0xNy45NywwLS40My4xLS44Ny0uMTMtMS4zNi0uODgtLjA1LTEuOCwwLTIuNy0uMTktMS43LS4zNS0yLjUyLTEuMzYtMi41NC0zLjIzLS4wMi0xLjkuNzQtMi44OSwyLjQ0LTMuMzIuOTQtLjI0LDEuOS0uMDcsMi45NC0uMjMsMC0xLjU1LjAxLTMuMDYsMC00LjU2LDAtLjguMDYtMS41OS4yNS0yLjM3LjQ2LTEuODcsMS44NC0zLjAxLDMuNzUtMy4xMywzLjgxLS4yMyw1LjU4LDEuNDIsNS42LDUuMjMsMCwxLjU5LDAsMy4xOCwwLDQuOS43OSwwLDEuNDkuMDIsMi4yLDAsLjY1LS4wMiwxLjI4LjA2LDEuOS4yMSwxLjI1LjMsMS45OSwxLjEzLDIuMTcsMi40LjA4LjU2LjA5LDEuMTEsMCwxLjY3LS4yMiwxLjMzLTEuMDUsMi4xNi0yLjQ0LDIuNDMtMS4xOS4yMy0yLjM4LjE5LTMuNTguMTctLjA2LS4wMy0uMTEtLjA2LS4xNy0uMDktLjAxLjA3LS4wMi4xMy0uMDQuMloiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy05IiBkPSJtMjI5LjY3LDMzLjkxYzEuMDgtMS42NywyLjA1LTMuMjksMy40Ni00LjYzLDEuNzUtMS42NSwzLjc3LTIuMzIsNi4xNS0xLjkzLDEuOTQuMzIsMy4zOSwxLjgzLDMuNjMsMy43Ny4xMywxLjA4LjE2LDIuMTYtLjMsMy4xNy0uNjcsMS40Ni0xLjgsMi4zLTMuNDQsMi40LS44NC4wNS0xLjY3LjA3LTIuNTEuMTYtMy43My4zOC01Ljk0LDIuODgtNi4yMiw2LjY5LS4wOSwxLjIzLS4wNSwyLjQ3LS4wNSwzLjcxLDAsMy43NSwwLDcuNTEsMCwxMS4yNiwwLC42OC0uMDYsMS4zNS0uMTYsMi4wMi0uNDIsMy4xLTIuNTcsMy45Ny00Ljg0LDMuODktMy4wMy0uMTEtNC40Ny0xLjYxLTQuNjUtNC42NS0uMDYtLjk2LS4wNi0xLjkyLS4wNi0yLjg3LDAtNy43MSwwLTE1LjQxLDAtMjMuMTIsMC0uOTIuMDQtMS44NC4xNS0yLjc1LjI2LTIuMywxLjc1LTMuNjcsNC4wNC0zLjc5LjMyLS4wMi42NC0uMDEuOTYsMCwyLjIyLjEsMy42NSwxLjQzLDMuODIsMy42NS4wOC45OS4wMSwxLjk5LjAxLDIuOTlaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTEuNjYsMTAxLjYydi0zNC41M2MuMS0uMDYuMTctLjEzLjIzLS4xMyw0LjkxLS4wMiw5LjgyLS4xNiwxNC43MS40MSw3LjQ0Ljg3LDEzLjAxLDYuMjYsMTQuMDYsMTMuNjguNTcsNC4wMi40LDcuOTMtMS4zOSwxMS42OS0yLjI3LDQuNzgtNS44OSw3LjcxLTExLjIsOC40OC0xLjkuMjctMy44LjQyLTUuNzIuNDEtMy4xNS0uMDItNi4zMSwwLTkuNDYsMC0uMzksMC0uNzgsMC0xLjIzLDBabTQuMzUtNC4zYzMuNjYuMDQsNy4yNC4wNiwxMC44MS0uNDIsNC4wMi0uNTQsNi44MS0yLjc0LDguNDktNi4zNiwxLjE5LTIuNTcsMS4zOC01LjMxLDEuMDEtOC4wNy0uNjctNC45Mi0zLjU3LTguNzMtOC4zOC0xMC4xOS0xLjQyLS40My0yLjg5LS42LTQuMzYtLjcxLTIuNS0uMTktNS4wMS0uMjItNy41OC0uMTd2MjUuOTRaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTE1NS40NiwxMDEuNThoLTMuOThjLS4yOS0uNDQtLjE2LS44OS0uMTYtMS4zMS0uMDItNC45NS0uMDMtOS45LS4wNC0xNC44NSwwLS44NS0uMTQtMS42Ny0uMzEtMi40OS0uMzktMS44OC0yLjA5LTMuMzYtNC4wMi0zLjU5LTMuOC0uNDUtNy4yMiwyLjM0LTcuODksNi40Mi0uMjEsMS4zLS4zLDIuNjEtLjMsMy45MywwLDMuOTEsMCw3LjgyLDAsMTEuODRoLTQuMjN2LTI1Ljc5Yy43MiwwLDEuNDIsMCwyLjEzLDAsLjY3LDAsMS4zMywwLDIuMDcsMHYyLjgxYy41NS0uMTIuNzctLjUzLDEuMDctLjgxLDMuNC0zLjE3LDguNDgtMy42LDEyLjEyLTEuMDMsMS4yMS44NSwyLjA0LDIsMi43NCwzLjQuODctMS4wNywxLjY4LTIuMDcsMi43LTIuODgsMy4wOS0yLjQ2LDguNTEtMy4zMywxMi4yNC4wMywxLjQxLDEuMjYsMi4xMSwyLjg2LDIuNTIsNC42NC40MSwxLjguNTIsMy42My41Miw1LjQ3LDAsNC40NywwLDguOTQsMCwxMy40MiwwLC4yMy0uMDMuNDctLjA1Ljc3aC00LjJjLS4yNC0uNC0uMTMtLjg1LS4xMy0xLjI3LDAtNC42MywwLTkuMjYsMC0xMy45LDAtMS4yNC0uMTEtMi40Ny0uNDEtMy42Ny0uNDYtMS44Mi0xLjk1LTMuMDctMy43OS0zLjM2LTMuODQtLjYtNy4yLDIuMTMtNy45Niw1LjgyLS4zOCwxLjg0LS41MSwzLjcxLS41MSw1LjU5LDAsMy4xOSwwLDYuMzksMCw5LjU4LDAsLjM5LjA5Ljc5LS4xMywxLjI0WiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im0xODEuOCw4OS41MWMuMTYsNC4yMSwyLjc1LDcuNTcsNi40Nyw4LjU5LDQuNDYsMS4yMiw4LjEyLS42MSwxMS40OS01LjgsMS4xOC42LDIuMzYsMS4yMSwzLjY2LDEuODgtMS45NSwzLjc1LTQuNTUsNi42OC04LjcxLDcuNzItNS4wNSwxLjI3LTkuNjkuNDgtMTMuNDktMy4zNS02LjM2LTYuNDItNC45OC0xOC4zNiw0LjAzLTIyLjM4LDcuODUtMy41LDE3LjM4LDEsMTguNTgsMTAuMzguMTIuOTUuMjYsMS44OS4xNiwyLjk2aC0yMi4xOVptMTcuMzMtMy44NmMuMTUtLjExLjE0LS4yMywwLS4zNC0xLjE2LTQuMS01LjMyLTYuNjctMTAuMjgtNS45My0yLjk4LjQ0LTUuOTMsMy4wOC02LjMyLDYuMjMuMTEuMDIuMjMuMDcuMzQuMDcsNS40MiwwLDEwLjg0LS4wMiwxNi4yNi0uMDNaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTIxMy44Nyw3OC42NGMxLjg4LTEuODIsNC4wMy0zLjExLDYuNjYtMy40OSw1LjQ2LS44MSwxMC4wNSwyLjU3LDEwLjkxLDcuNTIuMjksMS42Ni40NSwzLjMyLjQ2LDQuOTkuMDEsNC4zNSwwLDguNzEsMCwxMy4wNiwwLC4yNy4wOC41Ni0uMTcuODVoLTMuOThjLS4yOC0uNDMtLjE1LS44OC0uMTUtMS4zMS0uMDItNC43MS0uMDMtOS40Mi0uMDQtMTQuMTQsMC0uODgtLjExLTEuNzYtLjMyLTIuNjEtLjgxLTMuMjgtMy41NS00Ljk2LTYuOTEtNC4yOS0zLjc0Ljc1LTYuNDIsMy44OS02LjY5LDcuNzEtLjMxLDQuNDMtLjEzLDguODYtLjE5LDEzLjI5LDAsLjQzLDAsLjg2LDAsMS4zNGgtNC4yNnYtMjUuNzdjMS4zNC0uMTMsMi43Mi0uMDQsNC4xNC0uMDUuMjUuOTkuMDIsMS45NS4xNSwyLjg4LS4wMy4xMSwwLC4yLjEuMjYuMTYsMCwuMjYtLjA5LjMxLS4yNFoiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMTIzLjY4LDk4LjUyYy0uNjQuNTMtMS4yNSwxLjExLTEuOTMsMS41OS0yLjgyLDIuMDEtNS45NCwyLjctOS4zLDEuNzgtMy43Ni0xLjAzLTYuMjItNC4xLTYuNzItOC4xNi0uMTUtMS4xOS0uMjUtMi4zOC0uMjktMy41NywwLS4wOS0uMDEtLjE3LS4wMi0uMjZ2LTE0LjA4aDQuMjJjLjI0LjQyLjEyLjg2LjEzLDEuMjkuMDIsNC43MS4wMyw5LjQyLjA0LDE0LjEzLDAsLjk2LjE1LDEuOTEuNDEsMi44My44NSwzLjA5LDMuMTMsNC40MSw2LjI3LDQuMDgsNC4wNC0uNDMsNi45Ny0zLjc0LDcuMjUtNy44Mi4zLTQuMzkuMTMtOC43Ny4xOS0xMy4xNiwwLS40MywwLS44NiwwLTEuMzcsMS40Ni0uMTIsMi44My0uMDgsNC4yNi0uMDN2MjUuNzZoLTQuM3YtMi45N2MuMDUtLjA4LjA0LS4xNS0uMDQtLjItLjA1LjA1LS4xLjExLS4xNS4xNloiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy0xIiBkPSJtMTAwLjksODEuNmMtMS4xNy43My0yLjI4LDEuNDMtMy40MiwyLjE0LTEuMTEtMS41NC0yLjQtMi43OC00LjA4LTMuNTQtNC42OC0yLjEzLTEwLjYxLS45NC0xMy40NCwzLjY0LTMuMjgsNS4zMi0uMjIsMTIuNzUsNS45MiwxNC4yLDQsLjk1LDcuNjEuMTMsMTAuNTMtMi45NS4zNi0uMzcuNzEtLjc1LDEuMTMtMS4yLDEuMTEuNzMsMi4yLDEuNDUsMy4zNSwyLjIxLS43NSwxLjQ0LTEuODIsMi41OC0zLjExLDMuNDMtNS4xNSwzLjQxLTEwLjYzLDQuMDQtMTYuMjMsMS4zMy01LjItMi41Mi03Ljg3LTguMjMtNy4xMy0xMy45Ni42OS01LjM2LDUuNC0xMC45MSwxMS45NC0xMS42Nyw0LjE0LS40OCw3Ljk0LjIsMTEuMzUsMi42OCwxLjMxLjk1LDIuMzQsMi4xNSwzLjE5LDMuNzFaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTI2Ny43Miw3OC45NmMtLjk5Ljk1LTEuOSwxLjg0LTIuODcsMi43OC0uNjctLjUxLTEuMy0xLjE4LTIuMDktMS42NC0xLjEyLS42Ni0yLjI3LTEuMTgtMy42Mi0uODYtMS4xMy4yNy0xLjk5LjkyLTIuMjksMi4wNS0uMzIsMS4yMS4wNSwyLjI5LDEuMDYsMy4wOSwxLjE5Ljk1LDIuNTQsMS42NiwzLjg3LDIuMzgsMS4yLjY1LDIuMzMsMS4zOCwzLjM0LDIuMywyLjM5LDIuMTYsMi45OSw0Ljg1LDIuMDYsNy44NC0uOTQsMy4wNS0zLjExLDQuOTUtNi4yNCw1LjQyLTMuODYuNTctNy4wMy0uODItOS41MS0zLjkzLjgzLTEuMDgsMS43MS0yLjA0LDIuNjUtMy4wMS41NS4yMy44My43NCwxLjIzLDEuMSwxLjIsMS4wNiwyLjUsMS44Niw0LjE3LDEuODIsMS41My0uMDQsMi42Ny0uNzgsMy40Ny0yLjAyLjgxLTEuMjYuNDctMy4xLS43MS00LjEzLTEuMDMtLjktMi4yMy0xLjU0LTMuNDQtMi4xNi0xLjI1LS42My0yLjQ0LTEuMzYtMy41My0yLjI0LTIuNjMtMi4xNC0zLjAyLTUuMzMtMi4yNS03LjkyLjgtMi42OCwzLjU3LTQuNjIsNi41Ni00Ljc4LDEuNzMtLjA5LDMuMzIuMjksNC44LDEuMTksMS4yLjczLDIuMjksMS41OCwzLjMzLDIuNzJaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMSIgZD0ibTIzNS4wNCw3OS41OXYtMy43OWg0LjI0di05LjU2YzEuNDgtLjE2LDIuODMtLjA1LDQuMzEtLjA4djkuNTVoNS4wMWMuMzgsMS4zMy4wNSwyLjU0LjEzLDMuODdoLTQuOTVjLS4yNiwxLjY1LS4xNywxNy4zNC4xMSwxOC41OSwxLjE3LjMzLDIuNDEsMCwzLjY4LjIuMTYsMS4yLjAzLDIuMzguMDksMy42MS0xLjczLjQ3LTMuNDMuNTktNS4xMy4zNC0xLjY5LS4yNS0yLjc0LTEuNDItMy4wMi0zLjEyLS4xMy0uNzktLjE5LTEuNTgtLjE5LTIuMzguMDEtNS4yNywwLTEwLjU0LDAtMTUuODJ2LTEuNDFoLTQuMjlaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtNSIgZD0ibTE0MC41MSwzMS4yMWMtLjAzLjIxLS4xMy4zNS0uMzUuMzYtLjE1LS4xMS0uMTYtLjI1LS4xMS0uNDFsLjQ3LjA0WiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im0yMTMuODcsNzguNjRjLS4wNS4xNS0uMTUuMjQtLjMxLjI0LS4xLS4wNi0uMTMtLjE1LS4xLS4yNi4xNCwwLC4yNy4wMS40MS4wMloiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy0zIiBkPSJtMTIzLjY4LDk4LjUyYy4wNS0uMDUuMS0uMTEuMTUtLjE2LjA4LjA1LjEuMTIuMDQuMi0uMDcsMC0uMTMsMC0uMTktLjA0WiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTMiIGQ9Im0xMDUuNDEsODkuOWMwLC4wOS4wMS4xNy4wMi4yNi0uMTUtLjA4LS4xOC0uMTYtLjAyLS4yNloiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy01IiBkPSJtMTk0LjkxLDY1LjA0bC4yOC4wNGMtLjEyLjEzLS4yMS4wOS0uMjgtLjA0WiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTUiIGQ9Im0yMDcuMzMsNTkuODRjLjA3LS4wOS4xNS0uMTUuMjUtLjA2LjAzLjA0LDAsLjEzLDAsLjItLjA5LS4wNS0uMTctLjA5LS4yNi0uMTRaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtMiIgZD0ibTIxNi43MSw1Ny44MmMtLjExLS4wOS0uMTUtLjE5LS4wNi0uMzIuMDMuMDcuMDcuMTMuMDkuMjEsMCwuMDMtLjAyLjA3LS4wNC4xMVoiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy00IiBkPSJtMTQ1LjQ2LDM1LjE0Yy4wOS0uMS4yLS4xMy4zMy0uMDctLjA5LjExLS4yLjE1LS4zMy4wN1oiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy02IiBkPSJtMjU5Ljk2LDM0Ljg1Yy4wMS0uMDcuMDItLjEzLjA0LS4yLjA2LjAzLjExLjA2LjE3LjA5LS4wNS4wNi0uMTIuMS0uMi4xMVoiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy01IiBkPSJtMTMxLDMxLjY1Yy4xLjEzLjA1LjIyLS4wNi4zLS4wNS0uMTItLjAzLS4yMi4wNi0uM1oiLz4KICAgICAgPHBhdGggY2xhc3M9ImNscy04IiBkPSJtMjguODMsMjIuNjRjLS4wNy0uMTQtLjAzLS4yNC4wOS0uMzMuMDYuMTMuMDIuMjQtLjA5LjMzWiIvPgogICAgICA8cGF0aCBjbGFzcz0iY2xzLTEiIGQ9Im01Mi40OSw5OC4zNGMyLjM4LDAsNC4zNC0uNjgsNS45Ni0yLjA3LDQuODYtNC4xOCw0LjM2LTExLjgtMS0xNS40Ni0zLjc3LTIuNTctOC41Ny0yLTExLjU2LDEuNDUtMi4zNCwyLjctMi45NSw1Ljc5LTIuMTIsOS4yNi44OSwzLjcxLDQuNjksNy4wNiw4LjcyLDYuODNaIi8+CiAgICAgIDxwYXRoIGNsYXNzPSJjbHMtNyIgZD0ibTE5OS4xMyw4NS42NWMwLS4xMSwwLS4yMywwLS4zNC4xNC4xMS4xNS4yMywwLC4zNFoiLz4KICAgIDwvZz4KICA8L2c+Cjwvc3ZnPg==';

export {SMART_DOCUMENTS_PLUGIN_LOGO_BASE64};
