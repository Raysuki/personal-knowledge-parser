"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type PointerEvent, type WheelEvent } from "react";
import {
  Award,
  Briefcase,
  Calendar,
  Check,
  Circle,
  Download,
  FileText,
  FolderOpen,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  MoveRight,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Type,
  UploadCloud,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BasicInfo = {
  name: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  university: string | null;
  major: string | null;
  degree: string | null;
  graduation_year: string | null;
  current_status: string | null;
};

type EducationItem = {
  institution: string | null;
  major: string | null;
  degree: string | null;
  start_date: string | null;
  end_date: string | null;
  gpa: string | null;
  ranking: string | null;
  courses: string[];
};

type Experience = {
  category: string | null;
  name: string | null;
  role_or_title: string | null;
  organization: string | null;
  level: string | null;
  start_date: string | null;
  end_date: string | null;
  achievement: string | null;
  description: string | null;
};

type ParsedResult = {
  basic_info: BasicInfo;
  education_history: EducationItem[];
  experiences: Experience[];
};

type ApiPayload = {
  data?: ParsedResult;
  detail?: string;
  filename?: string;
  file_name?: string;
  file_hash?: string;
  doc_id?: number;
  input_type?: string;
  text_strategy?: string;
};

type SaveResponse = {
  success?: boolean;
  detail?: string;
  message?: string;
  doc_id?: number;
};

type KnowledgeBaseItem = {
  id: number;
  name: string;
  updated_at?: string | null;
  document_count?: number;
  data: ParsedResult;
};

type KnowledgeBaseListResponse = {
  detail?: string;
  items?: KnowledgeBaseItem[];
};

type KnowledgeBaseCreateResponse = {
  detail?: string;
  message?: string;
  item?: KnowledgeBaseItem;
};

type KnowledgeBaseRenameResponse = {
  detail?: string;
  message?: string;
  item?: { id: number; name: string; updated_at?: string | null };
};

type InputMode = "file" | "text";
type LeftTab = "upload" | "template";
type TagCategory = "技能证书" | "语言证书";

const emptyBasicInfo: BasicInfo = {
  name: "",
  gender: "",
  phone: "",
  email: "",
  birth_date: "",
  university: "",
  major: "",
  degree: "",
  graduation_year: "",
  current_status: "",
};

const emptyEducation: EducationItem = {
  institution: "",
  major: "",
  degree: "",
  start_date: "",
  end_date: "",
  gpa: "",
  ranking: "",
  courses: [],
};

const emptyExperience: Experience = {
  category: "",
  name: "",
  role_or_title: "",
  organization: "",
  level: "",
  start_date: "",
  end_date: "",
  achievement: "",
  description: "",
};

const emptyResult: ParsedResult = {
  basic_info: emptyBasicInfo,
  education_history: [],
  experiences: [],
};

const inputClassName =
  "border border-violet-300 bg-white/96 text-neutral-900 placeholder:text-neutral-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-violet-500 focus:ring-violet-500/15";

const basicFields: Array<{ key: keyof BasicInfo; label: string }> = [
  { key: "name", label: "姓名" },
  { key: "gender", label: "性别" },
  { key: "phone", label: "电话" },
  { key: "email", label: "邮箱" },
  { key: "birth_date", label: "出生日期" },
  { key: "university", label: "大学" },
  { key: "major", label: "专业" },
  { key: "degree", label: "学位" },
  { key: "graduation_year", label: "毕业年份" },
  { key: "current_status", label: "当前状态" },
];

const experienceFields: Array<{ key: keyof Experience; label: string; textarea?: boolean }> = [
  { key: "category", label: "类别" },
  { key: "name", label: "名称" },
  { key: "role_or_title", label: "角色 / 职位 / 奖项" },
  { key: "organization", label: "组织单位" },
  { key: "level", label: "级别" },
  { key: "start_date", label: "开始时间" },
  { key: "end_date", label: "结束时间" },
  { key: "achievement", label: "成果 / 分数 / 等级" },
  { key: "description", label: "详细描述", textarea: true },
];

function normalizeText(value: string | null | undefined) {
  return value ?? "";
}

function normalizePayload(payload: ApiPayload): ParsedResult {
  const data = payload.data ?? emptyResult;
  return {
    basic_info: {
      name: normalizeText(data.basic_info?.name),
      gender: normalizeText(data.basic_info?.gender),
      phone: normalizeText(data.basic_info?.phone),
      email: normalizeText(data.basic_info?.email),
      birth_date: normalizeText(data.basic_info?.birth_date),
      university: normalizeText(data.basic_info?.university),
      major: normalizeText(data.basic_info?.major),
      degree: normalizeText(data.basic_info?.degree),
      graduation_year: normalizeText(data.basic_info?.graduation_year),
      current_status: normalizeText(data.basic_info?.current_status),
    },
    education_history: Array.isArray(data.education_history)
      ? data.education_history.map((item) => ({
          institution: normalizeText(item?.institution),
          major: normalizeText(item?.major),
          degree: normalizeText(item?.degree),
          start_date: normalizeText(item?.start_date),
          end_date: normalizeText(item?.end_date),
          gpa: normalizeText(item?.gpa),
          ranking: normalizeText(item?.ranking),
          courses: Array.isArray(item?.courses) ? item.courses.filter(Boolean) : [],
        }))
      : [],
    experiences: Array.isArray(data.experiences)
      ? data.experiences.map((item) => ({
          category: normalizeText(item?.category),
          name: normalizeText(item?.name),
          role_or_title: normalizeText(item?.role_or_title),
          organization: normalizeText(item?.organization),
          level: normalizeText(item?.level),
          start_date: normalizeText(item?.start_date),
          end_date: normalizeText(item?.end_date),
          achievement: normalizeText(item?.achievement),
          description: normalizeText(item?.description),
        }))
      : [],
  };
}

function normalizeForCompare(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\s+/g, "").trim();
}

function tokenSet(value: string) {
  return new Set(
    value
      .split(/[\s,，。、；;:：/（）()[\]\-]+/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function overlapRatio(left: string, right: string) {
  const leftTokens = tokenSet(left);
  const rightTokens = tokenSet(right);
  if (!leftTokens.size || !rightTokens.size) return 0;
  let common = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) common += 1;
  });
  return common / Math.max(leftTokens.size, rightTokens.size);
}

function mergeUniqueBySignature(items: Experience[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const signature = Object.values(item).join("||");
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function mergeExperienceItem(base: Experience, incoming: Experience): Experience {
  const merged = { ...base };
  (Object.keys(base) as Array<keyof Experience>).forEach((key) => {
    const currentValue = normalizeText(base[key] as string | null | undefined);
    const incomingValue = normalizeText(incoming[key] as string | null | undefined);
    if (!currentValue && incomingValue) merged[key] = incomingValue;
  });
  return merged;
}

function isSimilarExperience(base: Experience, incoming: Experience) {
  const sameCategory = normalizeForCompare(base.category) === normalizeForCompare(incoming.category);
  const sameName = normalizeForCompare(base.name) === normalizeForCompare(incoming.name);
  const sameOrg = normalizeForCompare(base.organization) === normalizeForCompare(incoming.organization);
  const sameDate =
    normalizeForCompare(base.start_date) === normalizeForCompare(incoming.start_date) &&
    normalizeForCompare(base.end_date) === normalizeForCompare(incoming.end_date);
  const baseText = Object.values(base).map(normalizeText).join(" ");
  const incomingText = Object.values(incoming).map(normalizeText).join(" ");
  return (sameCategory && sameName) || (sameName && sameOrg) || (sameName && sameDate) || overlapRatio(baseText, incomingText) >= 0.72;
}

function mergeExperiences(baseItems: Experience[], incomingItems: Experience[]) {
  const merged = [...baseItems];
  incomingItems.forEach((incoming) => {
    const matchIndex = merged.findIndex((base) => isSimilarExperience(base, incoming));
    if (matchIndex >= 0) merged[matchIndex] = mergeExperienceItem(merged[matchIndex], incoming);
    else merged.push(incoming);
  });
  return mergeUniqueBySignature(merged);
}

function mergeEducationHistory(baseItems: EducationItem[], incomingItems: EducationItem[]) {
  const merged = [...baseItems];
  incomingItems.forEach((incoming) => {
    const matchIndex = merged.findIndex(
      (base) =>
        normalizeForCompare(base.institution) === normalizeForCompare(incoming.institution) &&
        normalizeForCompare(base.major) === normalizeForCompare(incoming.major),
    );
    if (matchIndex >= 0) {
      merged[matchIndex] = {
        institution: merged[matchIndex].institution || incoming.institution,
        major: merged[matchIndex].major || incoming.major,
        degree: merged[matchIndex].degree || incoming.degree,
        start_date: merged[matchIndex].start_date || incoming.start_date,
        end_date: merged[matchIndex].end_date || incoming.end_date,
        gpa: merged[matchIndex].gpa || incoming.gpa,
        ranking: merged[matchIndex].ranking || incoming.ranking,
        courses: Array.from(new Set([...(merged[matchIndex].courses ?? []), ...(incoming.courses ?? [])])).filter(Boolean),
      };
    } else {
      merged.push(incoming);
    }
  });
  return merged;
}

function mergeParsedResult(base: ParsedResult, incoming: ParsedResult): ParsedResult {
  const nextBasicInfo = { ...base.basic_info };
  (Object.keys(nextBasicInfo) as Array<keyof BasicInfo>).forEach((key) => {
    if (!normalizeText(nextBasicInfo[key]) && incoming.basic_info[key]) nextBasicInfo[key] = incoming.basic_info[key];
  });
  return {
    basic_info: nextBasicInfo,
    education_history: mergeEducationHistory(base.education_history, incoming.education_history),
    experiences: mergeExperiences(base.experiences, incoming.experiences),
  };
}

function parseCourses(value: string) {
  return value
    .split(/[,\uFF0C\u3001\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTimeLabel(value: string | null | undefined) {
  if (!value) return "未保存";
  return value.replace("T", " ").replace("Z", "");
}

function resolveApiMessage(
  message: string | null | undefined,
  fallback: string,
  options?: { duplicateFallback?: string },
) {
  const trimmed = (message ?? "").trim();
  const duplicateFallback = options?.duplicateFallback ?? fallback;

  if (!trimmed || /^[?？\s]+$/.test(trimmed)) return fallback;
  if (/already\s+exists|duplicate|exists|已存在|重名/i.test(trimmed)) return duplicateFallback;

  return trimmed;
}

function EditableField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className={multiline ? "space-y-2 md:col-span-2" : "space-y-2"}>
      <Label className="text-[15px] font-semibold text-black">{label}</Label>
      {multiline ? (
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} className={cn("min-h-[110px]", inputClassName)} />
      ) : (
        <Input value={value} onChange={(event) => onChange(event.target.value)} className={inputClassName} />
      )}
    </div>
  );
}

export default function KnowledgeParsePage() {
  const [leftPanelTab, setLeftPanelTab] = useState<LeftTab>("upload");
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(false);
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateMessage, setTemplateMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFillingTemplate, setIsFillingTemplate] = useState(false);
  const [isBaseLoading, setIsBaseLoading] = useState(false);
  const [isCreatingBase, setIsCreatingBase] = useState(false);
  const [renamingBaseId, setRenamingBaseId] = useState<number | null>(null);
  const [editingBaseName, setEditingBaseName] = useState("");
  const [isEditingBaseName, setIsEditingBaseName] = useState(false);
  const [deletingBaseId, setDeletingBaseId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [metaInfo, setMetaInfo] = useState("");
  const [docId, setDocId] = useState<number | null>(null);
  const [fileHash, setFileHash] = useState("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseItem[]>([]);
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
  const [newBaseName, setNewBaseName] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ category: TagCategory; index: number; name: string; detail: string } | null>(null);
  const [newTag, setNewTag] = useState<{ category: TagCategory; name: string; detail: string }>({
    category: "技能证书",
    name: "",
    detail: "",
  });
  const [toast, setToast] = useState<{ message: string; tone: "success" | "error"; visible: boolean } | null>(null);
  const dragRef = useRef({ isDragging: false, hasDragged: false, startX: 0, startY: 0 });
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const toolBarRef = useRef<HTMLDivElement | null>(null);
  const toolPanelRef = useRef<HTMLElement | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const toastCleanupRef = useRef<number | null>(null);
  const isImage = useMemo(() => file?.type.startsWith("image/") ?? false, [file]);
  const selectedBase = useMemo(() => knowledgeBases.find((item) => item.id === selectedBaseId) ?? null, [knowledgeBases, selectedBaseId]);
  const focusedBase = knowledgeBases[currentIndex] ?? null;
  const skillExperiences = useMemo(() => (result?.experiences ?? []).filter((item) => item.category === "技能证书"), [result]);
  const languageExperiences = useMemo(() => (result?.experiences ?? []).filter((item) => item.category === "语言证书"), [result]);
  const regularExperiences = useMemo(
    () => (result?.experiences ?? []).filter((item) => item.category !== "技能证书" && item.category !== "语言证书"),
    [result],
  );

  useEffect(() => {
    void loadKnowledgeBases();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
      if (toastCleanupRef.current) window.clearTimeout(toastCleanupRef.current);
    };
  }, []);

  useEffect(() => {
    if (saveMessage) showToast(saveMessage, "success");
  }, [saveMessage]);

  useEffect(() => {
    if (templateMessage) showToast(templateMessage, "success");
  }, [templateMessage]);

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error]);

  useEffect(() => {
    if (isDrawerOpen) setIsToolPanelOpen(false);
  }, [isDrawerOpen]);

  useEffect(() => {
    if (!isToolPanelOpen) return;

    function handlePointerDown(event: PointerEvent | globalThis.PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (toolPanelRef.current?.contains(target)) return;
      if (toolBarRef.current?.contains(target)) return;
      setIsToolPanelOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isToolPanelOpen]);

  useEffect(() => {
    if (!selectedBaseId) return;
    const selectedItem = knowledgeBases.find((item) => item.id === selectedBaseId);
    if (!selectedItem) return;
    setResult(normalizePayload({ data: selectedItem.data }));
    setDocId(null);
    setFileHash("");
    setSourceFileName(selectedItem.name);
  }, [selectedBaseId, knowledgeBases]);

  useEffect(() => {
    if (!isEditingBaseName) return;
    renameInputRef.current?.focus();
    renameInputRef.current?.select();
  }, [isEditingBaseName]);

  async function parseResponse(response: Response) {
    const raw = await response.text();
    try {
      return raw ? (JSON.parse(raw) as ApiPayload) : {};
    } catch {
      if (!response.ok) throw new Error(raw || "服务返回了非 JSON 错误响应。");
      throw new Error("服务返回内容无法解析。");
    }
  }

  function showToast(message: string, tone: "success" | "error") {
    if (toastTimeoutRef.current) window.clearTimeout(toastTimeoutRef.current);
    if (toastCleanupRef.current) window.clearTimeout(toastCleanupRef.current);
    setToast({ message, tone, visible: true });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast((prev) => (prev ? { ...prev, visible: false } : prev));
    }, 1000);
    toastCleanupRef.current = window.setTimeout(() => {
      setToast(null);
    }, 1600);
  }

  async function loadKnowledgeBases() {
    setIsBaseLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/knowledge-bases");
      const payload = (await response.json()) as KnowledgeBaseListResponse;
      if (!response.ok) throw new Error(payload.detail || "加载知识库列表失败。");
      const items = Array.isArray(payload.items)
        ? payload.items.map((item) => ({ ...item, data: normalizePayload({ data: item.data }) }))
        : [];
      setKnowledgeBases(items);
      if (items.length === 0) {
        setSelectedBaseId(null);
        setCurrentIndex(0);
        setResult(null);
        return;
      }
      setSelectedBaseId((prev) => (prev && items.some((item) => item.id === prev) ? prev : items[0].id));
      setCurrentIndex((prev) => Math.min(prev, items.length - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载知识库列表失败，请检查后端服务。");
    } finally {
      setIsBaseLoading(false);
    }
  }

  function resetPreview(nextFile: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(nextFile && nextFile.type.startsWith("image/") ? URL.createObjectURL(nextFile) : "");
  }

  function handleSelectFile(nextFile: File | null) {
    if (!nextFile) return;
    const name = nextFile.name.toLowerCase();
    const accepted =
      nextFile.type.startsWith("image/") ||
      nextFile.type === "application/pdf" ||
      nextFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      nextFile.type === "text/plain" ||
      name.endsWith(".docx") ||
      name.endsWith(".txt");
    if (!accepted) {
      setError("仅支持上传图片、PDF、DOCX 或 TXT 文件。");
      return;
    }
    setError("");
    setSaveMessage("");
    setMetaInfo("");
    setDocId(null);
    setFileHash("");
    setSourceFileName(nextFile.name);
    setFile(nextFile);
    resetPreview(nextFile);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleSelectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function handleTemplateFileSelect(nextFile: File | null) {
    if (!nextFile) return;
    const name = nextFile.name.toLowerCase();
    const accepted =
      nextFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      nextFile.type === "application/msword" ||
      name.endsWith(".docx") ||
      name.endsWith(".doc");
    if (!accepted) {
      setError("模板文件仅支持 DOC 或 DOCX 格式。");
      return;
    }
    setError("");
    setTemplateMessage("");
    setTemplateFile(nextFile);
  }

  async function handleParse() {
    setIsLoading(true);
    setError("");
    setSaveMessage("");
    setMetaInfo("");
    try {
      if (!selectedBaseId) throw new Error("请先创建并选择一个目标知识库。");
      let response: Response;
      if (inputMode === "file") {
        if (!file) throw new Error("请先选择一个文件。");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("knowledge_base_id", String(selectedBaseId));
        response = await fetch("http://localhost:8000/api/extract", { method: "POST", body: formData });
      } else {
        if (!textInput.trim()) throw new Error("请先输入需要解析的文本内容。");
        const formData = new FormData();
        formData.append("text", textInput);
        formData.append("knowledge_base_id", String(selectedBaseId));
        response = await fetch("http://localhost:8000/api/extract", { method: "POST", body: formData });
      }
      const payload = await parseResponse(response);
      if (!response.ok) throw new Error(payload.detail || "解析失败，请稍后重试。");
      const parsedResult = normalizePayload(payload);
      setResult((prev) => (prev ? mergeParsedResult(prev, parsedResult) : parsedResult));
      setDocId(typeof payload.doc_id === "number" ? payload.doc_id : null);
      setFileHash(payload.file_hash ?? "");
      setSourceFileName(payload.file_name ?? payload.filename ?? "");
      const parts: string[] = [];
      if (payload.input_type) parts.push(`输入类型: ${payload.input_type}`);
      if (payload.text_strategy) parts.push(`提取策略: ${payload.text_strategy}`);
      if (payload.filename) parts.push(`文件: ${payload.filename}`);
      setMetaInfo(parts.join(" · "));
      setIsDrawerOpen(true);
    } catch (err) {
      if (err instanceof TypeError) setError("无法连接到后端服务，请确认 http://localhost:8000 正在运行。");
      else setError(err instanceof Error ? err.message : "解析失败，请检查前后端服务。");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    if (!result) return;
    setIsSaving(true);
    setError("");
    setSaveMessage("");
    try {
      if (!selectedBaseId) throw new Error("请先选择目标知识库。");
      const response = await fetch("http://localhost:8000/api/knowledge/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledge_base_id: selectedBaseId,
          doc_id: docId,
          user_id: null,
          file_name: sourceFileName || file?.name || (inputMode === "text" ? "direct_input.txt" : null),
          file_hash: fileHash || null,
          basic_info: result.basic_info,
          education_history: result.education_history,
          experiences: result.experiences,
        }),
      });
      const payload = (await response.json()) as SaveResponse;
      if (!response.ok) throw new Error(payload.detail || "保存失败，请稍后重试。");
      if (typeof payload.doc_id === "number") setDocId(payload.doc_id);
      setSaveMessage("保存成功");
      await loadKnowledgeBases();
    } catch (err) {
      if (err instanceof TypeError) setError("无法连接到后端服务，请确认 http://localhost:8000 正在运行。");
      else setError(err instanceof Error ? err.message : "保存失败，请检查后端服务。");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFillTemplate() {
    if (!selectedBaseId) {
      setError("请先选择目标知识库。");
      return;
    }
    if (!templateFile) {
      setError("请先上传 Word 模板。");
      return;
    }
    setIsFillingTemplate(true);
    setError("");
    setTemplateMessage("");
    try {
      const formData = new FormData();
      formData.append("file", templateFile);
      formData.append("knowledge_base_id", String(selectedBaseId));
      const response = await fetch("http://localhost:8000/api/templates/fill", { method: "POST", body: formData });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { detail?: string };
        throw new Error(payload.detail || "模板填充失败。");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename=\"?([^\";]+)\"?/i);
      const downloadName = match?.[1] || "filled_template.docx";
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = downloadName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setTemplateMessage("模板填充完成，已开始下载。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "模板填充失败，请检查后端服务。");
    } finally {
      setIsFillingTemplate(false);
    }
  }

  async function handleCreateKnowledgeBase() {
    if (!newBaseName.trim()) {
      setError("请输入知识库名称。");
      return;
    }
    setIsCreatingBase(true);
    setError("");
    setSaveMessage("");
    try {
      const response = await fetch("http://localhost:8000/api/knowledge-bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBaseName.trim() }),
      });
      const payload = (await response.json()) as KnowledgeBaseCreateResponse;
      if (!response.ok) {
        throw new Error(
          resolveApiMessage(payload.detail, "创建知识库失败，请检查后重试。", {
            duplicateFallback: "该知识库名称已存在，请更换一个名称。",
          }),
        );
      }
      setNewBaseName("");
      setSaveMessage("知识库创建成功");
      setIsCreateModalOpen(false);
      await loadKnowledgeBases();
      if (payload.item?.id) {
        setSelectedBaseId(payload.item.id);
        setCurrentIndex(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "创建知识库失败，请检查后端服务。");
    } finally {
      setIsCreatingBase(false);
    }
  }

  async function handleDeleteKnowledgeRecord(knowledgeBaseId: number) {
    setDeletingBaseId(knowledgeBaseId);
    setError("");
    setSaveMessage("");
    try {
      const response = await fetch(`http://localhost:8000/api/knowledge-bases/${knowledgeBaseId}`, { method: "DELETE" });
      const payload = (await response.json()) as SaveResponse;
      if (!response.ok) throw new Error(payload.detail || "删除知识库失败。");
      setSaveMessage("资料库已删除");
      await loadKnowledgeBases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "删除知识库失败，请检查后端服务。");
    } finally {
      setDeletingBaseId(null);
    }
  }

  async function handleRenameKnowledgeBase(knowledgeBaseId: number) {
    const nextName = editingBaseName.trim();
    if (!nextName) {
      setError("请输入新的资料库名称。");
      return;
    }
    setRenamingBaseId(knowledgeBaseId);
    try {
      const response = await fetch(`http://localhost:8000/api/knowledge-bases/${knowledgeBaseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nextName }),
      });
      const payload = (await response.json()) as KnowledgeBaseRenameResponse;
      if (!response.ok) {
        throw new Error(
          resolveApiMessage(payload.detail, "资料库名称更新失败，请稍后重试。", {
            duplicateFallback: "该知识库名称已存在，请更换一个名称。",
          }),
        );
      }
      setSaveMessage("资料库名称已更新");
      setEditingBaseName("");
      await loadKnowledgeBases();
    } catch (err) {
      setError(err instanceof Error ? err.message : "资料库名称更新失败，请检查后端服务。");
    } finally {
      setRenamingBaseId(null);
    }
  }

  function updateBasicInfo(field: keyof BasicInfo, value: string) {
    setResult((prev) => (prev ? { ...prev, basic_info: { ...prev.basic_info, [field]: value } } : prev));
  }

  function addEducation() {
    setResult((prev) => ({
      ...(prev ?? emptyResult),
      basic_info: prev?.basic_info ?? emptyBasicInfo,
      education_history: [...(prev?.education_history ?? []), { ...emptyEducation }],
      experiences: prev?.experiences ?? [],
    }));
  }

  function updateEducation(index: number, updates: Partial<EducationItem>) {
    setResult((prev) => {
      if (!prev) return prev;
      const next = [...prev.education_history];
      next[index] = { ...next[index], ...updates };
      return { ...prev, education_history: next };
    });
  }

  function removeEducation(index: number) {
    setResult((prev) => (prev ? { ...prev, education_history: prev.education_history.filter((_, i) => i !== index) } : prev));
  }

  function addExperience() {
    setResult((prev) => ({
      ...(prev ?? emptyResult),
      basic_info: prev?.basic_info ?? emptyBasicInfo,
      education_history: prev?.education_history ?? [],
      experiences: [...(prev?.experiences ?? []), { ...emptyExperience }],
    }));
  }

  function updateRegularExperience(index: number, updates: Partial<Experience>) {
    setResult((prev) => {
      if (!prev) return prev;
      let matched = -1;
      const experiences = prev.experiences.map((item) => {
        if (item.category === "技能证书" || item.category === "语言证书") return item;
        matched += 1;
        return matched === index ? { ...item, ...updates } : item;
      });
      return { ...prev, experiences };
    });
  }

  function removeRegularExperience(index: number) {
    setResult((prev) => {
      if (!prev) return prev;
      let matched = -1;
      return {
        ...prev,
        experiences: prev.experiences.filter((item) => {
          if (item.category === "技能证书" || item.category === "语言证书") return true;
          matched += 1;
          return matched !== index;
        }),
      };
    });
  }

  function updateTagExperience(category: TagCategory, index: number, updates: Partial<Experience>) {
    setResult((prev) => {
      if (!prev) return prev;
      let matched = -1;
      return {
        ...prev,
        experiences: prev.experiences.map((item) => {
          if (item.category !== category) return item;
          matched += 1;
          return matched === index ? { ...item, ...updates } : item;
        }),
      };
    });
  }

  function removeTagExperience(category: TagCategory, index: number) {
    setResult((prev) => {
      if (!prev) return prev;
      let matched = -1;
      return {
        ...prev,
        experiences: prev.experiences.filter((item) => {
          if (item.category !== category) return true;
          matched += 1;
          return matched !== index;
        }),
      };
    });
  }

  function addTag(category: TagCategory) {
    if (!newTag.name.trim()) return;
    const detail = newTag.detail.trim();
    const newExperience: Experience = {
      ...emptyExperience,
      category,
      name: newTag.name.trim(),
      achievement: detail,
      description: category === "技能证书" ? detail : "",
    };
    setResult((prev) => ({
      ...(prev ?? emptyResult),
      basic_info: prev?.basic_info ?? emptyBasicInfo,
      education_history: prev?.education_history ?? [],
      experiences: [...(prev?.experiences ?? []), newExperience],
    }));
    setNewTag({ category, name: "", detail: "" });
  }

  function saveTagEdit() {
    if (!editingTag) return;
    const detail = editingTag.detail.trim();
    updateTagExperience(editingTag.category, editingTag.index, {
      name: editingTag.name.trim(),
      achievement: detail,
      description: editingTag.category === "技能证书" ? detail : "",
    });
    setEditingTag(null);
  }

  function focusCard(index: number) {
    if (knowledgeBases.length === 0) return;
    const normalized = Math.max(0, Math.min(index, knowledgeBases.length - 1));
    setCurrentIndex(normalized);
  }

  function getCardTransform(index: number, isSelected: boolean) {
    const offset = index - currentIndex;
    if (offset === 0) {
      return {
        transform: "translate3d(60px, 0px, 40px) rotateY(0deg) scale(1)",
        opacity: 1,
        zIndex: 100,
        filter: "blur(0px)",
        boxShadow: isSelected
          ? "-20px 30px 60px -10px rgba(147, 51, 234, 0.12), 0 0 0 2px rgba(147,51,234,0.92)"
          : "-20px 30px 60px -10px rgba(0, 0, 0, 0.12), 0 0 15px rgba(0,0,0,0.03)",
      };
    }
    if (offset > 0) {
      const angleStep = 7;
      const radiusX = 1100;
      const radiusZ = 1600;
      const thetaRad = (offset * angleStep * Math.PI) / 180;
      const translateX = radiusX * Math.sin(thetaRad) + 120;
      const translateZ = radiusZ * Math.cos(thetaRad) - radiusZ - 40;
      return {
        transform: `translate3d(${translateX}px, 0px, ${translateZ}px) rotateY(${-offset * angleStep}deg) scale(1)`,
        opacity: Math.max(0, 1 - offset * 0.08),
        zIndex: 100 - offset,
        filter: `blur(${Math.max(0, (offset - 1.5) * 0.5)}px)`,
        boxShadow: isSelected ? "-5px 10px 25px rgba(147, 51, 234, 0.1), 0 0 0 2px rgba(147,51,234,0.9)" : "-5px 10px 25px rgba(0,0,0,0.04)",
      };
    }
    return {
      transform: "translate3d(-600px, 0px, 200px) rotateY(15deg) scale(1.1)",
      opacity: 0,
      zIndex: 100 + offset,
      pointerEvents: "none" as const,
    };
  }

  function handleWheel(event: WheelEvent<HTMLDivElement>) {
    if (isDrawerOpen) return;
    event.preventDefault();
    if (event.deltaY > 20) focusCard(currentIndex + 1);
    else if (event.deltaY < -20) focusCard(currentIndex - 1);
  }

  function handleDragStart(event: PointerEvent<HTMLDivElement>) {
    if (isDrawerOpen) return;
    dragRef.current.isDragging = true;
    dragRef.current.hasDragged = false;
    dragRef.current.startX = event.pageX;
    dragRef.current.startY = event.pageY;
  }

  function handleDragMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.isDragging || isDrawerOpen) return;
    const deltaX = dragRef.current.startX - event.pageX;
    const deltaY = dragRef.current.startY - event.pageY;
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) dragRef.current.hasDragged = true;
    if (Math.abs(deltaX) > 60 || Math.abs(deltaY) > 60) {
      if (Math.abs(deltaX) > Math.abs(deltaY) ? deltaX > 0 : deltaY > 0) focusCard(currentIndex + 1);
      else focusCard(currentIndex - 1);
      dragRef.current.startX = event.pageX;
      dragRef.current.startY = event.pageY;
    }
  }

  function handleDragEnd() {
    dragRef.current.isDragging = false;
  }

  const stats = focusedBase
    ? {
        edu: focusedBase.data.education_history.length,
        exp: focusedBase.data.experiences.filter((item) => item.category !== "技能证书" && item.category !== "语言证书").length,
        skill: focusedBase.data.experiences.filter((item) => item.category === "技能证书").length,
        lang: focusedBase.data.experiences.filter((item) => item.category === "语言证书").length,
      }
    : { edu: 0, exp: 0, skill: 0, lang: 0 };

  function toggleToolPanel(tab: LeftTab) {
    if (isToolPanelOpen && leftPanelTab === tab) {
      setIsToolPanelOpen(false);
      return;
    }
    setLeftPanelTab(tab);
    setIsDrawerOpen(false);
    setIsToolPanelOpen(true);
  }

  async function submitRenameKnowledgeBase() {
    if (!selectedBase || !isEditingBaseName) return;
    const nextName = editingBaseName.trim();
    if (!nextName) {
      setEditingBaseName(selectedBase.name);
      setIsEditingBaseName(false);
      return;
    }
    if (nextName === selectedBase.name) {
      setIsEditingBaseName(false);
      return;
    }
    await handleRenameKnowledgeBase(selectedBase.id);
    setIsEditingBaseName(false);
  }

  return (
    <main className="relative h-screen overflow-hidden px-4 py-6 text-neutral-900 md:px-6">
      <div className="page-glow" />
      <div className="mx-auto flex h-full max-w-[1500px] flex-col">
        <div className="mb-8 px-3">
          <div className="relative max-w-[980px]">
            <div className="pointer-events-none absolute -left-8 top-2 h-24 w-24 rounded-full bg-violet-300/20 blur-3xl" />
            <div className="pointer-events-none absolute left-44 top-0 h-16 w-40 bg-[linear-gradient(90deg,rgba(167,139,250,0),rgba(167,139,250,0.26),rgba(167,139,250,0))] blur-2xl" />
            <p className="text-[10px] font-semibold text-[#7c6999] md:text-[11px]">Jianliu ProfileFlow</p>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[720px]">
                <h1 className="text-[3rem] font-extrabold leading-[0.9] tracking-[-0.08em] text-[#2c2738] md:text-[5.3rem]">
                  简流
                  <span className="ml-2 inline-block bg-[linear-gradient(135deg,#34146c_0%,#4b2e83_45%,#b7a9da_100%)] bg-clip-text text-transparent md:ml-5">
                    ProfileFlow+
                  </span>
                </h1>
              </div>
            </div>
            <p className="mt-4 max-w-[520px] pl-[2px] text-[15px] leading-7 text-neutral-600 md:text-[18px]">
              履历如流，填表轻松。
            </p>
          </div>
        </div>

        <div className="relative min-h-0 flex-1">
          <div ref={toolBarRef} className="fixed left-5 top-1/2 z-[70] -translate-y-1/2">
            <div className="flex flex-col gap-3 rounded-[1.7rem] border border-white/85 bg-white/92 p-2 shadow-[0_18px_40px_rgba(139,92,246,0.16)] backdrop-blur-xl">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white text-violet-600 transition-all hover:bg-violet-50 hover:text-violet-700"
                title="新建资料库"
              >
                {isCreatingBase ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus size={22} />}
              </button>
              <button
                type="button"
                onClick={() => toggleToolPanel("upload")}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-[1.2rem] transition-all",
                  leftPanelTab === "upload" && isToolPanelOpen
                    ? "bg-violet-600 text-white shadow-[0_12px_26px_rgba(139,92,246,0.28)]"
                    : "bg-white text-violet-600 hover:bg-violet-50",
                )}
                title="资料上传"
              >
                <UploadCloud size={22} />
              </button>
              <button
                type="button"
                onClick={() => toggleToolPanel("template")}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-[1.2rem] transition-all",
                  leftPanelTab === "template" && isToolPanelOpen
                    ? "bg-violet-600 text-white shadow-[0_12px_26px_rgba(139,92,246,0.28)]"
                    : "bg-white text-violet-600 hover:bg-violet-50",
                )}
                title="一键填表"
              >
                <FileText size={22} />
              </button>
            </div>
          </div>

          <section ref={toolPanelRef} className={cn("absolute left-[92px] top-1/2 z-[60] flex h-[80%] w-full max-w-[448px] -translate-y-1/2 flex-col rounded-[2rem] border border-white/92 bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(249,244,255,0.96))] p-7 shadow-[0_30px_70px_rgba(109,40,217,0.18)] backdrop-blur-xl transition-all duration-500 ease-out", isToolPanelOpen ? "translate-x-0 opacity-100" : "-translate-x-[110%] opacity-0 pointer-events-none")}>
            <div className="flex flex-1 flex-col pt-3">
              {leftPanelTab === "upload" ? (
                <div className="flex flex-1 flex-col justify-center">
                  <div className="mb-6 flex rounded-[16px] border border-violet-100 bg-[linear-gradient(180deg,rgba(245,238,255,0.96),rgba(239,231,255,0.82))] p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <button type="button" onClick={() => setInputMode("file")} className={cn("flex-1 rounded-[12px] py-3 text-[14px] font-bold transition-all", inputMode === "file" ? "bg-white text-violet-600 shadow-[0_8px_20px_rgba(139,92,246,0.12)]" : "text-neutral-600 hover:text-black")}>
                      文件上传
                    </button>
                    <button type="button" onClick={() => setInputMode("text")} className={cn("flex-1 rounded-[12px] py-3 text-[14px] font-bold transition-all", inputMode === "text" ? "bg-white text-violet-600 shadow-[0_8px_20px_rgba(139,92,246,0.12)]" : "text-neutral-600 hover:text-black")}>
                      直接文本
                    </button>
                  </div>

                  {inputMode === "file" ? (
                    <div onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} className={cn("group relative mb-6 flex min-h-[320px] flex-1 cursor-pointer flex-col items-center justify-center rounded-[28px] border-2 border-dashed transition-colors shadow-[0_18px_40px_rgba(139,92,246,0.08)]", isDragging ? "border-violet-500 bg-[linear-gradient(180deg,rgba(243,232,255,0.95),rgba(237,228,255,0.8))]" : "border-violet-300 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,238,255,0.92))] hover:border-violet-400 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(242,234,255,0.95))]")}>
                      <input type="file" accept="image/*,application/pdf,.docx,.txt,text/plain" className="absolute inset-0 cursor-pointer opacity-0" onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)} />
                      {file ? (
                        <div className="flex w-full flex-col items-center gap-4 px-6">
                          {isImage && previewUrl ? <img src={previewUrl} alt="文件预览" className="h-44 w-full rounded-[20px] object-cover shadow-md" /> : <div className="flex h-32 w-full items-center justify-center rounded-[20px] border border-violet-100 bg-white shadow-md"><FileText className="mr-3 h-7 w-7 text-violet-600" /><span className="text-sm font-medium">{file.name}</span></div>}
                          <div className="w-full rounded-[18px] border border-violet-100 bg-white/95 px-4 py-3 text-left shadow-sm">
                            <p className="truncate text-sm font-medium text-neutral-900">{file.name}</p>
                            <p className="mt-1 text-xs text-neutral-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-100 text-violet-600 shadow-[0_10px_24px_rgba(139,92,246,0.14)] transition-transform group-hover:-translate-y-1">
                            <UploadCloud size={28} />
                          </div>
                          <p className="mb-2 text-[17px] font-bold text-black">拖拽文件到这里</p>
                          <p className="mb-5 px-8 text-center text-[13px] leading-relaxed text-neutral-400">支持图片、PDF、DOCX、TXT，也可以点击直接选择</p>
                          <div className="flex items-center gap-1.5 rounded-full border border-violet-100 bg-white/92 px-4 py-2 text-[12px] font-medium text-neutral-600 shadow-sm">
                            <ImageIcon size={14} /> PNG / JPG / PDF / DOCX / TXT
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6 flex flex-1 flex-col">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-neutral-600">
                        <Type className="h-4 w-4 text-violet-500" />
                        直接输入文本材料
                      </div>
                      <Textarea value={textInput} onChange={(event) => setTextInput(event.target.value)} placeholder="请在此粘贴您的纯文本履历内容..." className={cn("min-h-[320px] flex-1 rounded-[24px] border-[1.5px] border-violet-300 p-6 text-[15px] text-neutral-700 focus:border-violet-500", inputClassName)} />
                    </div>
                  )}

                  {metaInfo ? <div className="mb-4 text-sm text-violet-600">{metaInfo}</div> : null}

                  <button type="button" className="mt-auto w-full rounded-2xl bg-[#1a1a1a] py-4 text-[16px] font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-black active:scale-[0.98]" onClick={handleParse} disabled={isLoading || !selectedBaseId || (inputMode === "file" && !file) || (inputMode === "text" && !textInput.trim())}>
                    {isLoading ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />解析中...</span> : "开始解析"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-1 flex-col justify-center">
                  <label className="mx-auto mb-6 flex w-full max-w-[460px] flex-1 cursor-pointer items-center justify-center">
                    <input type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(event) => handleTemplateFileSelect(event.target.files?.[0] ?? null)} />
                    <div className="flex w-full flex-col items-center text-center">
                      <div className="mb-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-[2rem] bg-[linear-gradient(180deg,rgba(243,232,255,0.95),rgba(237,228,255,0.75))] text-violet-600 shadow-[0_18px_38px_rgba(139,92,246,0.12)]">
                        <FileText size={34} strokeWidth={1.5} />
                      </div>
                      <div className="w-full rounded-[28px] border border-violet-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,243,255,0.96))] p-6 shadow-[0_18px_40px_rgba(139,92,246,0.08)] transition-all hover:border-violet-300 hover:shadow-[0_22px_46px_rgba(139,92,246,0.12)]">
                        <div className="mb-5 flex flex-wrap items-center justify-center gap-4">
                          <span className="rounded-2xl bg-[#F3E8FF] px-8 py-3 text-[15px] font-bold text-[#7E22CE] transition hover:bg-[#ead9ff]">选择文件</span>
                          <span className="max-w-[220px] truncate text-[14px] font-medium text-neutral-500">{templateFile ? templateFile.name : "未选择文件"}</span>
                        </div>
                        <p className="text-[15px] leading-relaxed text-neutral-600">请上传一个 DOC 或 DOCX 模板文件。</p>
                      </div>
                    </div>
                  </label>

                  <button type="button" className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1a1a1a] py-4 text-[16px] font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-black active:scale-[0.98]" onClick={handleFillTemplate} disabled={isFillingTemplate || !selectedBaseId || !templateFile}>
                    {isFillingTemplate ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />} {isFillingTemplate ? "填充中..." : "一键填充"}
                  </button>
                </div>
              )}
            </div>
          </section>
          <section className={cn("relative z-0 flex h-full min-h-0 items-center justify-center overflow-hidden touch-none transition-all duration-500 ease-out", isToolPanelOpen ? "pl-[180px]" : "pl-0", isDrawerOpen ? "pr-[260px]" : "pr-0")} style={{ perspective: "2200px" }} onWheel={handleWheel} onPointerDown={handleDragStart} onPointerMove={handleDragMove} onPointerUp={handleDragEnd} onPointerLeave={handleDragEnd}>
            {knowledgeBases.length === 0 ? (
              <div className="flex h-full w-full flex-col items-center justify-center text-neutral-400">
                <FolderOpen size={64} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">暂无资料库，请点击左侧工具栏顶部创建</p>
              </div>
            ) : (
              <div className="absolute h-[640px] w-full transition-all duration-500 ease-out" style={{ transformStyle: "preserve-3d", left: isDrawerOpen ? "calc(50% - 360px)" : isToolPanelOpen ? "calc(50% - 60px)" : "calc(50% - 210px)" }}>
                {knowledgeBases.map((lib, idx) => {
                  const isActive = idx === currentIndex;
                  const isSelected = lib.id === selectedBaseId;
                  const style = getCardTransform(idx, isSelected);
                  const expCount = lib.data.experiences.filter((item) => item.category !== "技能证书" && item.category !== "语言证书").length;
                  const skillCount = lib.data.experiences.filter((item) => item.category === "技能证书").length;
                  const langCount = lib.data.experiences.filter((item) => item.category === "语言证书").length;
                  return (
                    <div
                      key={lib.id}
                      className={cn("absolute left-0 top-0 flex h-[640px] w-[420px] flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]", isSelected ? "border-transparent" : "border-neutral-200")}
                      style={{ ...style, transformOrigin: "center left" }}
                      onDoubleClick={() => {
                        if (!dragRef.current.hasDragged && isActive) {
                          setIsToolPanelOpen(false);
                          setSelectedBaseId(lib.id);
                          setIsDrawerOpen(true);
                        }
                      }}
                      onClick={() => {
                        if (!dragRef.current.hasDragged) {
                          focusCard(idx);
                          setSelectedBaseId(lib.id);
                        }
                      }}
                    >
                      <div className="group/card relative flex h-full flex-col p-10">
                        {isSelected ? (
                          <div className="absolute right-8 top-8 z-10 flex items-center gap-1.5 rounded-full bg-violet-600 px-4 py-2 text-[13px] font-bold text-white shadow-lg shadow-violet-600/30">
                            <Check size={16} strokeWidth={3} />
                            当前选中
                          </div>
                        ) : isActive ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedBaseId(lib.id);
                            }}
                            className="absolute right-8 top-8 z-10 flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-[13px] font-bold text-neutral-400 shadow-sm opacity-0 transition-all hover:border-violet-500 hover:bg-white hover:text-violet-600 group-hover/card:opacity-100"
                          >
                            <Circle size={16} strokeWidth={2} />
                            设为选中
                          </button>
                        ) : null}

                        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-xl border border-violet-100 bg-[linear-gradient(180deg,rgba(245,238,255,0.96),rgba(238,229,255,0.9))] text-violet-300">
                          <span className="font-mono text-xl font-black">{String(idx + 1).padStart(2, "0")}</span>
                        </div>
                        <h2 className={cn("mb-4 pr-10 text-[28px] font-bold leading-[1.3] tracking-tight line-clamp-2", isActive ? "text-black" : "text-neutral-600")}>{lib.name}</h2>

                        <div className="mb-8 space-y-3">
                          <div className="flex items-center gap-3 text-[13px] font-medium text-neutral-500">
                            <FileText size={16} className="text-neutral-400" /> 文档数：{lib.document_count ?? 0}
                          </div>
                          <div className="flex items-center gap-3 text-[13px] font-medium text-neutral-500">
                            <Calendar size={16} className="text-neutral-400" /> 更新于 {formatTimeLabel(lib.updated_at).split(" ")[0]}
                          </div>
                        </div>

                        <div className="mb-8 grid grid-cols-2 gap-3">
                          <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-[linear-gradient(180deg,rgba(247,242,255,0.96),rgba(241,234,255,0.9))] px-4 py-3"><span className="flex items-center gap-2 text-[12px] font-bold uppercase text-neutral-500"><GraduationCap size={14} /> Edu</span><span className="font-mono font-bold text-neutral-700">{lib.data.education_history.length}</span></div>
                          <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-[linear-gradient(180deg,rgba(247,242,255,0.96),rgba(241,234,255,0.9))] px-4 py-3"><span className="flex items-center gap-2 text-[12px] font-bold uppercase text-neutral-500"><Briefcase size={14} /> Exp</span><span className="font-mono font-bold text-neutral-700">{expCount}</span></div>
                          <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-[linear-gradient(180deg,rgba(247,242,255,0.96),rgba(241,234,255,0.9))] px-4 py-3"><span className="flex items-center gap-2 text-[12px] font-bold uppercase text-neutral-500"><Award size={14} /> Skl</span><span className="font-mono font-bold text-neutral-700">{skillCount}</span></div>
                          <div className="flex items-center justify-between rounded-xl border border-violet-100 bg-[linear-gradient(180deg,rgba(247,242,255,0.96),rgba(241,234,255,0.9))] px-4 py-3"><span className="flex items-center gap-2 text-[12px] font-bold uppercase text-neutral-500"><Globe size={14} /> Lng</span><span className="font-mono font-bold text-neutral-700">{langCount}</span></div>
                        </div>

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsToolPanelOpen(false);
                            setSelectedBaseId(lib.id);
                            setIsDrawerOpen(true);
                          }}
                          className="absolute bottom-8 right-8 flex h-11 w-11 items-center justify-center rounded-full border border-violet-100 bg-white text-violet-600 shadow-[0_10px_24px_rgba(139,92,246,0.12)] transition-all hover:translate-x-0.5 hover:bg-violet-50"
                          title="打开详情"
                        >
                          <MoveRight size={18} />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

      </div>
      {toast ? (
        <div className={cn("fixed left-1/2 top-1/2 z-[120] -translate-x-1/2 -translate-y-1/2 transition-all duration-500", toast.visible ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
          <div className={cn("min-w-[280px] rounded-[1.6rem] border border-violet-200 bg-white px-6 py-4 text-center text-lg font-semibold text-violet-700 shadow-[0_18px_40px_rgba(139,92,246,0.16)] backdrop-blur-xl", toast.tone === "error" ? "ring-1 ring-rose-200/60 text-violet-800" : "ring-1 ring-violet-100")}>
            {toast.message}
          </div>
        </div>
      ) : null}

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm">
          <div className="w-full max-w-[760px] rounded-[1.75rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,238,255,0.96))] p-5 shadow-[0_30px_80px_rgba(139,92,246,0.14)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-violet-500 uppercase">Create Library</p>
                <h3 className="mt-1 text-2xl font-bold text-neutral-900">新建资料库</h3>
              </div>
              <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-500 shadow-sm hover:text-neutral-900" onClick={() => setIsCreateModalOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex gap-3">
              <Input value={newBaseName} onChange={(event) => setNewBaseName(event.target.value)} placeholder="输入知识库名称，例如：求职简历库" className={cn("h-14 rounded-[1.2rem] text-base", inputClassName)} />
              <Button className="h-14 rounded-[1.2rem] bg-[#8f73eb] px-6 text-base text-white hover:bg-[#7d60de]" onClick={handleCreateKnowledgeBase} disabled={isCreatingBase || !newBaseName.trim()}>
                {isCreatingBase ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                创建
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isDrawerOpen ? <button type="button" aria-label="close detail panel" className="fixed inset-0 z-[95]" onClick={() => setIsDrawerOpen(false)} /> : null}
      <div className={cn("fixed right-4 top-[112px] z-[100] flex h-[calc(100vh-136px)] w-full max-w-[560px] flex-col overflow-hidden rounded-[2rem] border border-white/92 bg-[linear-gradient(180deg,#fcf9ff_0%,#f6f0ff_100%)] shadow-[0_30px_70px_rgba(109,40,217,0.18)] backdrop-blur-xl transition-all duration-500 ease-out", isDrawerOpen ? "translate-x-0 opacity-100" : "translate-x-[110%] opacity-0 pointer-events-none")}>
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[2rem] border-b border-violet-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,238,255,0.96))] px-10 py-6 backdrop-blur">
              <div className="flex-1 pr-6">
                {selectedBase && isEditingBaseName ? (
                  <Input
                    ref={renameInputRef}
                    value={editingBaseName}
                    onChange={(event) => setEditingBaseName(event.target.value)}
                    onBlur={() => {
                      void submitRenameKnowledgeBase();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void submitRenameKnowledgeBase();
                      }
                      if (event.key === "Escape") {
                        setEditingBaseName(selectedBase.name);
                        setIsEditingBaseName(false);
                      }
                    }}
                    className={cn("h-12 text-2xl font-bold tracking-tight", inputClassName)}
                  />
                ) : (
                  <>
                    <button
                      type="button"
                      className="max-w-full truncate pr-4 text-left text-2xl font-bold transition-colors hover:text-violet-700"
                      onClick={() => {
                        if (!selectedBase) return;
                        setEditingBaseName(selectedBase.name);
                        setIsEditingBaseName(true);
                      }}
                    >
                      {selectedBase?.name ?? "资料详情"}
                    </button>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-violet-700/70">知识库资料详情</p>
                  </>
                )}
              </div>
              <div className="flex items-center gap-3">
                {selectedBase ? (
                  <>
                    <button type="button" onClick={() => handleDeleteKnowledgeRecord(selectedBase.id)} className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500 transition-all hover:bg-red-500 hover:text-white" title="删除" disabled={deletingBaseId === selectedBase.id}>
                      {deletingBaseId === selectedBase.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </>
                ) : null}
                <Button className="bg-emerald-500 text-white hover:bg-emerald-600" onClick={handleSave} disabled={!result || isSaving || !selectedBaseId}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  {isSaving ? "保存中..." : "保存入库"}
                </Button>
              </div>
            </div>

            <div className="custom-scrollbar flex-1 space-y-8 overflow-y-auto bg-[radial-gradient(circle_at_top,rgba(196,181,253,0.16),transparent_28%)] p-10 pb-32 text-neutral-800">
              {result ? (
                <>
                  <section className="rounded-2xl border border-violet-100 bg-white/90 p-5 shadow-[0_12px_30px_rgba(139,92,246,0.06)]">
                    <h3 className="mb-4 text-lg font-bold text-neutral-900">基础信息</h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {basicFields.map((field) => (
                        <EditableField key={field.key} label={field.label} value={result.basic_info[field.key] ?? ""} onChange={(value) => updateBasicInfo(field.key, value)} />
                      ))}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-violet-100 bg-[#fcfaff] p-5 shadow-[0_12px_30px_rgba(139,92,246,0.06)]">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-neutral-900">教育经历</h3>
                      <Button variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" onClick={addEducation}>
                        <Plus className="mr-2 h-4 w-4" />
                        新增
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {result.education_history.length === 0 ? <p className="text-sm italic text-neutral-600">暂无记录</p> : null}
                      {result.education_history.map((item, idx) => (
                        <div key={`${item.institution}-${idx}`} className="rounded-2xl border border-violet-100 bg-[linear-gradient(180deg,#ffffff_0%,#faf6ff_100%)] p-5">
                          <div className="mb-3 flex justify-end">
                            <button type="button" onClick={() => removeEducation(idx)} className="text-sm font-medium text-rose-500 hover:underline">删除</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <EditableField label="学校名称" value={item.institution ?? ""} onChange={(value) => updateEducation(idx, { institution: value })} />
                            <EditableField label="专业" value={item.major ?? ""} onChange={(value) => updateEducation(idx, { major: value })} />
                            <EditableField label="学位" value={item.degree ?? ""} onChange={(value) => updateEducation(idx, { degree: value })} />
                            <EditableField label="GPA" value={item.gpa ?? ""} onChange={(value) => updateEducation(idx, { gpa: value })} />
                            <EditableField label="开始时间" value={item.start_date ?? ""} onChange={(value) => updateEducation(idx, { start_date: value })} />
                            <EditableField label="结束时间" value={item.end_date ?? ""} onChange={(value) => updateEducation(idx, { end_date: value })} />
                            <EditableField label="排名" value={item.ranking ?? ""} onChange={(value) => updateEducation(idx, { ranking: value })} />
                            <EditableField label="课程列表" value={item.courses.join("、")} onChange={(value) => updateEducation(idx, { courses: parseCourses(value) })} multiline />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                  {[
                    { title: "技能标签", category: "技能证书" as TagCategory, items: skillExperiences, nameLabel: "技能名称", detailLabel: "熟练程度" },
                    { title: "语言证书", category: "语言证书" as TagCategory, items: languageExperiences, nameLabel: "证书名称", detailLabel: "分数 / 等级" },
                  ].map((section) => (
                    <section key={section.category} className="rounded-2xl border border-violet-100 bg-[#fcfaff] p-5 shadow-[0_12px_30px_rgba(139,92,246,0.06)]">
                      <h3 className="mb-4 text-lg font-bold text-neutral-900">{section.title}</h3>
                      <div className="mb-4 flex min-h-14 flex-wrap gap-3">
                        {section.items.length === 0 ? <div className="rounded-full border border-dashed border-violet-200 bg-violet-50/80 px-4 py-3 text-sm text-neutral-700">当前没有提取到 {section.title}，你可以手动补充。</div> : null}
                        {section.items.map((item, index) => (
                          <div key={`${section.category}-${index}`} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 shadow-sm">
                            <span className="text-sm font-medium text-neutral-900">{item.name || "未命名"}</span>
                            {item.achievement || item.description ? <span className="rounded-full bg-white px-2 py-0.5 text-xs text-neutral-700">{item.achievement || item.description}</span> : null}
                            <button type="button" className="text-neutral-600 hover:text-violet-600" onClick={() => setEditingTag({ category: section.category, index, name: item.name ?? "", detail: String(item.achievement ?? item.description ?? "") })}>
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button type="button" className="text-neutral-600 hover:text-rose-500" onClick={() => removeTagExperience(section.category, index)}>
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                        <Input value={newTag.category === section.category ? newTag.name : ""} onChange={(event) => setNewTag({ category: section.category, name: event.target.value, detail: newTag.category === section.category ? newTag.detail : "" })} placeholder={section.nameLabel} className={inputClassName} />
                        <Input value={newTag.category === section.category ? newTag.detail : ""} onChange={(event) => setNewTag({ category: section.category, name: newTag.category === section.category ? newTag.name : "", detail: event.target.value })} placeholder={section.detailLabel} className={inputClassName} />
                        <Button variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" onClick={() => addTag(section.category)}>
                          <Plus className="mr-2 h-4 w-4" />
                          新增
                        </Button>
                      </div>
                    </section>
                  ))}

                  <section className="rounded-2xl border border-violet-100 bg-[#fcfaff] p-5 shadow-[0_12px_30px_rgba(139,92,246,0.06)]">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-neutral-900">经历条目</h3>
                      <Button variant="outline" className="border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100" onClick={addExperience}>
                        <Plus className="mr-2 h-4 w-4" />
                        新增
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {regularExperiences.length === 0 ? <p className="text-sm italic text-neutral-600">暂无记录</p> : null}
                      {regularExperiences.map((item, idx) => (
                        <div key={`${item.name}-${idx}`} className="rounded-2xl border border-violet-100 bg-[linear-gradient(180deg,#ffffff_0%,#faf6ff_100%)] p-5">
                          <div className="mb-3 flex justify-end">
                            <button type="button" onClick={() => removeRegularExperience(idx)} className="text-sm font-medium text-rose-500 hover:underline">删除</button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {experienceFields.map((field) => (
                              <EditableField key={field.key} label={field.label} value={item[field.key] ?? ""} onChange={(value) => updateRegularExperience(idx, { [field.key]: value })} multiline={field.textarea} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-violet-200 bg-white/90 text-center text-neutral-600">
                  <FileText className="mb-4 h-8 w-8" />
                  <p className="text-lg font-semibold text-neutral-800">等待解析结果</p>
                  <p className="mt-2 max-w-md text-sm leading-6 text-neutral-600">左侧上传文件或直接粘贴文本，解析完成后会在这里展示结构化履历结果。</p>
                </div>
              )}
            </div>
          </div>
      {editingTag ? (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-violet-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-violet-500">Edit Tag</p>
                <h3 className="mt-2 text-lg font-semibold text-neutral-900">编辑 tag</h3>
              </div>
              <button type="button" className="rounded-full p-2 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-900" onClick={() => setEditingTag(null)}>
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-black">{editingTag.category === "技能证书" ? "技能名称" : "证书名称"}</Label>
                <Input value={editingTag.name} onChange={(event) => setEditingTag({ ...editingTag, name: event.target.value })} className={inputClassName} />
              </div>
              <div className="space-y-2">
                <Label className="text-black">{editingTag.category === "技能证书" ? "熟练程度" : "分数 / 等级"}</Label>
                <Input value={editingTag.detail} onChange={(event) => setEditingTag({ ...editingTag, detail: event.target.value })} className={inputClassName} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" className="border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50" onClick={() => setEditingTag(null)}>
                取消
              </Button>
              <Button className="bg-violet-600 px-5 text-white hover:bg-violet-700" onClick={saveTagEdit}>
                保存修改
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
