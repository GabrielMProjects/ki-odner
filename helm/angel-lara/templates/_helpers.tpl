{{/* Basis-Name */}}
{{- define "angel-lara.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Voller Name (Release + Chart) */}}
{{- define "angel-lara.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/* Komponenten-Namen */}}
{{- define "angel-lara.frontend.fullname" -}}
{{- printf "%s-frontend" (include "angel-lara.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "angel-lara.backend.fullname" -}}
{{- printf "%s-backend" (include "angel-lara.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "angel-lara.worker.fullname" -}}
{{- printf "%s-worker" (include "angel-lara.fullname" .) | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/* Gemeinsame Labels */}}
{{- define "angel-lara.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ include "angel-lara.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/* Selector-Labels */}}
{{- define "angel-lara.selectorLabels" -}}
app.kubernetes.io/name: {{ include "angel-lara.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/* Gemeinsame envFrom (ConfigMap + Secret) */}}
{{- define "angel-lara.envFrom" -}}
- configMapRef:
    name: {{ include "angel-lara.fullname" . }}-config
- secretRef:
    name: {{ include "angel-lara.fullname" . }}-secret
{{- end -}}

{{/* Backend-Image */}}
{{- define "angel-lara.backend.image" -}}
{{- printf "%s:%s" .Values.backend.image.repository (.Values.backend.image.tag | toString) -}}
{{- end -}}
