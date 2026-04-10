"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent, type MouseEvent, type WheelEvent } from "react";
import {
  Download,
  FileText,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  knowledge_id?: number;
  knowledge_base_id?: number;
};

type KnowledgeBaseItem = {
  id: number;
  name: string;
  user_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  document_count?: number;
  data: ParsedResult;
};

type KnowledgeBaseListResponse = {
  success?: boolean;
  detail?: string;
  items?: KnowledgeBaseItem[];
};

type KnowledgeBaseCreateResponse = {
  success?: boolean;
  detail?: string;
  message?: string;
  item?: KnowledgeBaseItem;
};

type KnowledgeBaseRenameResponse = {
  success?: boolean;
  detail?: string;
  message?: string;
  item?: {
    id: number;
    name: string;
    updated_at?: string | null;
  };
};

type InputMode = "file" | "text";
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

const marqueeFallbackCards = [
  { code: "01", title: "图片 / PDF / DOCX 联合解析", detail: "兼容多格式资料，统一收敛成可编辑结构。" },
  { code: "02", title: "技能与语言自动聚合", detail: "用 tag 方式压缩冗余字段，预览更利落。" },
  { code: "03", title: "结果校对后直接入库", detail: "上传、修订、保存的链路在同一工作台完成。" },
  { code: "04", title: "Word 模板一键回填", detail: "适合报名表、申请表、标准简历等复用场景。" },
];

function revealStyle(order: number): CSSProperties {
  return {
    ["--reveal-order" as string]: order,
  };
}

function VerticalWord({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("vertical-word", className)} aria-label={text}>
      {text.split("").map((letter, index) => (
        <span
          key={`${text}-${letter}-${index}`}
          className="vertical-word__letter"
          style={{ ["--letter-index" as string]: index } as CSSProperties}
          aria-hidden="true"
        >
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </div>
  );
}

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

function parseCourses(value: string) {
  return value
    .split(/[,，、\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatTimeLabel(value: string | null | undefined) {
  if (!value) return "未保存时间";
  return value.replace("T", " ").replace("Z", "");
}

function mergeUniqueBySignature(items: Experience[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const signature = [
      item.category ?? "",
      item.name ?? "",
      item.role_or_title ?? "",
      item.organization ?? "",
      item.level ?? "",
      item.start_date ?? "",
      item.end_date ?? "",
      item.achievement ?? "",
      item.description ?? "",
    ].join("||");
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function mergeEducation(items: EducationItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const signature = [
      item.institution ?? "",
      item.major ?? "",
      item.degree ?? "",
      item.start_date ?? "",
      item.end_date ?? "",
      item.gpa ?? "",
      item.ranking ?? "",
      item.courses.join("|"),
    ].join("||");
    if (seen.has(signature)) return false;
    seen.add(signature);
    return true;
  });
}

function normalizeForCompare(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/\s+/g, "").trim();
}

function tokenSet(value: string) {
  return new Set(
    value
      .split(/[\s,，。、；;:：|/（）()\-[\]]+/)
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

function mergeExperienceItem(base: Experience, incoming: Experience): Experience {
  const merged = { ...base };
  (Object.keys(base) as Array<keyof Experience>).forEach((key) => {
    const currentValue = normalizeText(base[key] as string | null | undefined);
    const incomingValue = normalizeText(incoming[key] as string | null | undefined);
    if (!currentValue && incomingValue) {
      merged[key] = incomingValue;
    }
  });
  return merged;
}

function isSimilarExperience(base: Experience, incoming: Experience) {
  const sameCategory = normalizeForCompare(base.category) === normalizeForCompare(incoming.category);
  const sameName = normalizeForCompare(base.name) && normalizeForCompare(base.name) === normalizeForCompare(incoming.name);
  const sameOrg =
    normalizeForCompare(base.organization) &&
    normalizeForCompare(base.organization) === normalizeForCompare(incoming.organization);
  const sameDate =
    normalizeForCompare(base.start_date) &&
    normalizeForCompare(base.start_date) === normalizeForCompare(incoming.start_date) &&
    normalizeForCompare(base.end_date) === normalizeForCompare(incoming.end_date);

  const baseText = [
    base.category,
    base.name,
    base.role_or_title,
    base.organization,
    base.level,
    base.start_date,
    base.end_date,
    base.achievement,
    base.description,
  ]
    .map(normalizeText)
    .join(" ");

  const incomingText = [
    incoming.category,
    incoming.name,
    incoming.role_or_title,
    incoming.organization,
    incoming.level,
    incoming.start_date,
    incoming.end_date,
    incoming.achievement,
    incoming.description,
  ]
    .map(normalizeText)
    .join(" ");

  return (sameCategory && sameName) || (sameName && sameOrg) || (sameName && sameDate) || overlapRatio(baseText, incomingText) >= 0.72;
}

function mergeExperiences(baseItems: Experience[], incomingItems: Experience[]) {
  const merged = [...baseItems];
  incomingItems.forEach((incoming) => {
    const matchIndex = merged.findIndex((base) => isSimilarExperience(base, incoming));
    if (matchIndex >= 0) {
      merged[matchIndex] = mergeExperienceItem(merged[matchIndex], incoming);
    } else {
      merged.push(incoming);
    }
  });
  return mergeUniqueBySignature(merged);
}

function mergeEducationItem(base: EducationItem, incoming: EducationItem): EducationItem {
  return {
    institution: base.institution || incoming.institution,
    major: base.major || incoming.major,
    degree: base.degree || incoming.degree,
    start_date: base.start_date || incoming.start_date,
    end_date: base.end_date || incoming.end_date,
    gpa: base.gpa || incoming.gpa,
    ranking: base.ranking || incoming.ranking,
    courses: Array.from(new Set([...(base.courses ?? []), ...(incoming.courses ?? [])])).filter(Boolean),
  };
}

function isSimilarEducation(base: EducationItem, incoming: EducationItem) {
  const sameInstitution =
    normalizeForCompare(base.institution) &&
    normalizeForCompare(base.institution) === normalizeForCompare(incoming.institution);
  const sameMajor = normalizeForCompare(base.major) && normalizeForCompare(base.major) === normalizeForCompare(incoming.major);
  const sameDegree = normalizeForCompare(base.degree) && normalizeForCompare(base.degree) === normalizeForCompare(incoming.degree);

  return (sameInstitution && sameMajor) || (sameInstitution && sameDegree);
}

function mergeEducationHistory(baseItems: EducationItem[], incomingItems: EducationItem[]) {
  const merged = [...baseItems];
  incomingItems.forEach((incoming) => {
    const matchIndex = merged.findIndex((base) => isSimilarEducation(base, incoming));
    if (matchIndex >= 0) {
      merged[matchIndex] = mergeEducationItem(merged[matchIndex], incoming);
    } else {
      merged.push(incoming);
    }
  });
  return mergeEducation(merged);
}

function mergeParsedResult(base: ParsedResult, incoming: ParsedResult): ParsedResult {
  const nextBasicInfo = { ...base.basic_info };
  (Object.keys(nextBasicInfo) as Array<keyof BasicInfo>).forEach((key) => {
    const currentValue = normalizeText(nextBasicInfo[key]);
    const incomingValue = incoming.basic_info[key];
    if (!currentValue && incomingValue) {
      nextBasicInfo[key] = incomingValue;
    }
  });

  return {
    basic_info: nextBasicInfo,
    education_history: mergeEducationHistory(base.education_history, incoming.education_history),
    experiences: mergeExperiences(base.experiences, incoming.experiences),
  };
}

export default function KnowledgeParsePage() {
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFillingTemplate, setIsFillingTemplate] = useState(false);
  const [isBaseLoading, setIsBaseLoading] = useState(false);
  const [isCreatingBase, setIsCreatingBase] = useState(false);
  const [renamingBaseId, setRenamingBaseId] = useState<number | null>(null);
  const [editingBaseId, setEditingBaseId] = useState<number | null>(null);
  const [editingBaseName, setEditingBaseName] = useState("");
  const [deletingBaseId, setDeletingBaseId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [metaInfo, setMetaInfo] = useState("");
  const [result, setResult] = useState<ParsedResult | null>(null);
  const [docId, setDocId] = useState<number | null>(null);
  const [fileHash, setFileHash] = useState("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateMessage, setTemplateMessage] = useState("");
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBaseItem[]>([]);
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null);
    const [currentBaseIndex, setCurrentBaseIndex] = useState(0);
    const [libraryRotation, setLibraryRotation] = useState(0);
  const [newBaseName, setNewBaseName] = useState("");
  const [editingTag, setEditingTag] = useState<{ category: TagCategory; index: number; name: string; detail: string } | null>(null);
  const [newTag, setNewTag] = useState<{ category: TagCategory; name: string; detail: string }>({
    category: "技能证书",
    name: "",
    detail: "",
  });
    const libraryStackRef = useRef<HTMLDivElement | null>(null);
    const wheelSnapTimeoutRef = useRef<number | null>(null);
    const previousBaseCountRef = useRef(0);

  const isImage = useMemo(() => file?.type.startsWith("image/") ?? false, [file]);
  const skillExperiences = useMemo(() => (result?.experiences ?? []).filter((item) => item.category === "技能证书"), [result]);
  const languageExperiences = useMemo(() => (result?.experiences ?? []).filter((item) => item.category === "语言证书"), [result]);
  const regularExperiences = useMemo(
    () => (result?.experiences ?? []).filter((item) => item.category !== "技能证书" && item.category !== "语言证书"),
    [result],
  );
  const totalDocuments = useMemo(
    () => knowledgeBases.reduce((sum, item) => sum + (item.document_count ?? 0), 0),
    [knowledgeBases],
  );
  const totalExperiences = useMemo(
    () => knowledgeBases.reduce((sum, item) => sum + (item.data.experiences?.length ?? 0), 0),
    [knowledgeBases],
  );
  const totalEducationRecords = useMemo(
    () => knowledgeBases.reduce((sum, item) => sum + (item.data.education_history?.length ?? 0), 0),
    [knowledgeBases],
  );
  const selectedBase = knowledgeBases.find((item) => item.id === selectedBaseId) ?? null;
  const marqueeCards = useMemo(() => {
    if (knowledgeBases.length === 0) {
      return marqueeFallbackCards;
    }

    return knowledgeBases.slice(0, 6).map((item, index) => {
      const regularCount = (item.data.experiences ?? []).filter(
        (entry) => entry.category !== "技能证书" && entry.category !== "语言证书",
      ).length;

      return {
        code: String(index + 1).padStart(2, "0"),
        title: item.name,
        detail: `${item.document_count ?? 0} 份文档 · ${item.data.education_history.length} 段教育 · ${regularCount} 条经历`,
      };
    });
  }, [knowledgeBases]);

  function handleCardPointerMove(event: MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    event.currentTarget.style.setProperty("--spotlight-x", `${x}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${y}px`);
  }

  function handleCardPointerLeave(event: MouseEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty("--spotlight-x");
    event.currentTarget.style.removeProperty("--spotlight-y");
  }

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    void loadKnowledgeBases();
  }, []);

    useEffect(() => {
      if (!selectedBaseId) return;
      const selectedItem = knowledgeBases.find((item) => item.id === selectedBaseId);
      if (!selectedItem) return;
      const selectedIndex = knowledgeBases.findIndex((item) => item.id === selectedBaseId);
      if (selectedIndex >= 0) {
        setCurrentBaseIndex(selectedIndex);
        setLibraryRotation(selectedIndex);
      }
    setResult(normalizePayload({ data: selectedItem.data }));
    setDocId(null);
    setFileHash("");
    setSourceFileName(selectedItem.name);
    setMetaInfo(
      [
        `知识库: ${selectedItem.name}`,
        selectedItem.updated_at ? `最近更新: ${formatTimeLabel(selectedItem.updated_at)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    );
  }, [selectedBaseId, knowledgeBases]);

  useEffect(() => {
    if (knowledgeBases.length === 0) {
      previousBaseCountRef.current = 0;
      setCurrentBaseIndex(0);
      setLibraryRotation(0);
      return;
    }

    const countChanged = previousBaseCountRef.current !== knowledgeBases.length;
    if (!countChanged) return;

    const selectedIndex = selectedBaseId
      ? knowledgeBases.findIndex((item) => item.id === selectedBaseId)
      : -1;
    const fallbackIndex = ((currentBaseIndex % knowledgeBases.length) + knowledgeBases.length) % knowledgeBases.length;
    const nextIndex = selectedIndex >= 0 ? selectedIndex : fallbackIndex;

    setCurrentBaseIndex(nextIndex);
    setLibraryRotation(nextIndex);
    previousBaseCountRef.current = knowledgeBases.length;
  }, [knowledgeBases.length, selectedBaseId, currentBaseIndex, knowledgeBases]);

    useEffect(() => {
      return () => {
        if (wheelSnapTimeoutRef.current) {
          window.clearTimeout(wheelSnapTimeoutRef.current);
        }
      };
    }, []);

    useEffect(() => {
      const node = libraryStackRef.current;
      if (!node) return;

    const handleWheelEvent = (event: globalThis.WheelEvent) => {
      event.preventDefault();
      handleLibraryWheel(event);
    };

      node.addEventListener("wheel", handleWheelEvent, { passive: false });
      return () => {
        node.removeEventListener("wheel", handleWheelEvent);
      };
  }, [knowledgeBases.length, libraryRotation]);

  function resetPreview(nextFile: File | null) {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
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

  async function parseResponse(response: Response) {
    const raw = await response.text();
    try {
      return raw ? (JSON.parse(raw) as ApiPayload) : {};
    } catch {
      if (!response.ok) throw new Error(raw || "服务返回了非 JSON 错误响应。");
      throw new Error("服务返回内容无法解析。");
    }
  }

  async function loadKnowledgeBases() {
    setIsBaseLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/knowledge-bases");
      const payload = (await response.json()) as KnowledgeBaseListResponse;
      if (!response.ok) {
        throw new Error(payload.detail || "加载知识库列表失败。");
      }

      const items = Array.isArray(payload.items)
        ? payload.items.map((item) => ({
            ...item,
            data: normalizePayload({ data: item.data }),
          }))
        : [];
      setKnowledgeBases(items);

      if (items.length === 0) {
        setSelectedBaseId(null);
        setResult(null);
        return;
      }

      const nextBaseId = selectedBaseId && items.some((item) => item.id === selectedBaseId) ? selectedBaseId : items[0].id;
      setSelectedBaseId(nextBaseId);
      const selectedItem = items.find((item) => item.id === nextBaseId);
      if (selectedItem) {
        setResult(normalizePayload({ data: selectedItem.data }));
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("加载知识库列表失败，请检查后端服务。");
      }
    } finally {
      setIsBaseLoading(false);
    }
  }

  async function handleParse() {
    setIsLoading(true);
    setError("");
    setSaveMessage("");
    setMetaInfo("");

    try {
      if (!selectedBaseId) {
        throw new Error("请先创建并选择一个目标知识库。");
      }
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
      setResult((prev) => (prev && selectedBaseId ? mergeParsedResult(prev, parsedResult) : parsedResult));
      setDocId(typeof payload.doc_id === "number" ? payload.doc_id : null);
      setFileHash(payload.file_hash ?? "");
      setSourceFileName(payload.file_name ?? payload.filename ?? "");

      const parts: string[] = [];
      if (payload.input_type) parts.push(`输入类型: ${payload.input_type}`);
      if (payload.text_strategy) parts.push(`提取策略: ${payload.text_strategy}`);
      if (payload.filename) parts.push(`文件: ${payload.filename}`);
      setMetaInfo(parts.join(" · "));
    } catch (err) {
      if (err instanceof TypeError) {
        setError("无法连接到后端服务，请确认 http://localhost:8000 正在运行。");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("解析失败，请检查前后端服务。");
      }
    } finally {
      setIsLoading(false);
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
      const educationHistory = [...prev.education_history];
      educationHistory[index] = { ...educationHistory[index], ...updates };
      return { ...prev, education_history: educationHistory };
    });
  }

  function removeEducation(index: number) {
    setResult((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        education_history: prev.education_history.filter((_, currentIndex) => currentIndex !== index),
      };
    });
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
      let matchedIndex = -1;
      const experiences = prev.experiences.map((item) => {
        if (item.category === "技能证书" || item.category === "语言证书") return item;
        matchedIndex += 1;
        return matchedIndex === index ? { ...item, ...updates } : item;
      });
      return { ...prev, experiences };
    });
  }

  function removeRegularExperience(index: number) {
    setResult((prev) => {
      if (!prev) return prev;
      let matchedIndex = -1;
      const experiences = prev.experiences.filter((item) => {
        if (item.category === "技能证书" || item.category === "语言证书") return true;
        matchedIndex += 1;
        return matchedIndex !== index;
      });
      return { ...prev, experiences };
    });
  }

  function updateTagExperience(category: TagCategory, index: number, updates: Partial<Experience>) {
    setResult((prev) => {
      if (!prev) return prev;
      let matchedIndex = -1;
      const experiences = prev.experiences.map((item) => {
        if (item.category !== category) return item;
        matchedIndex += 1;
        return matchedIndex === index ? { ...item, ...updates } : item;
      });
      return { ...prev, experiences };
    });
  }

  function removeTagExperience(category: TagCategory, index: number) {
    setResult((prev) => {
      if (!prev) return prev;
      let matchedIndex = -1;
      const experiences = prev.experiences.filter((item) => {
        if (item.category !== category) return true;
        matchedIndex += 1;
        return matchedIndex !== index;
      });
      return { ...prev, experiences };
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

  async function handleSave() {
    if (!result) return;

    setIsSaving(true);
    setError("");
    setSaveMessage("");

    try {
      if (!selectedBaseId) {
        throw new Error("请先选择目标知识库。");
      }
      const response = await fetch("http://localhost:8000/api/knowledge/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      if (!response.ok) {
        throw new Error(payload.detail || "保存失败，请稍后重试。");
      }

      if (typeof payload.doc_id === "number") {
        setDocId(payload.doc_id);
      }

      setSaveMessage(payload.message || "保存成功");
      console.log("保存入库数据:", result, payload);
      await loadKnowledgeBases();
    } catch (err) {
      if (err instanceof TypeError) {
        setError("无法连接到后端服务，请确认 http://localhost:8000 正在运行。");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("保存失败，请检查后端服务。");
      }
    } finally {
      setIsSaving(false);
    }
  }

  function loadKnowledgeItem(item: KnowledgeBaseItem) {
    setResult(normalizePayload({ data: item.data }));
    setDocId(null);
    setFileHash("");
    setSourceFileName(item.name);
    setSelectedBaseId(item.id);
    setSaveMessage(`已加载知识库「${item.name}」`);
    setError("");
    setMetaInfo(
      [
        `知识库: ${item.name}`,
        item.updated_at ? `最近更新: ${formatTimeLabel(item.updated_at)}` : null,
      ]
        .filter(Boolean)
        .join(" · "),
    );
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newBaseName.trim() }),
      });
      const payload = (await response.json()) as KnowledgeBaseCreateResponse;
      if (!response.ok) {
        throw new Error(payload.detail || "创建知识库失败。");
      }
      setNewBaseName("");
      setSaveMessage(payload.message || "知识库创建成功");
      await loadKnowledgeBases();
      if (payload.item?.id) {
        setSelectedBaseId(payload.item.id);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("创建知识库失败，请检查后端服务。");
      }
    } finally {
      setIsCreatingBase(false);
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

      const response = await fetch("http://localhost:8000/api/templates/fill", {
        method: "POST",
        body: formData,
      });

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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("模板填充失败，请检查后端服务。");
      }
    } finally {
      setIsFillingTemplate(false);
    }
  }

  async function handleDeleteKnowledgeRecord(knowledgeBaseId: number) {
    setDeletingBaseId(knowledgeBaseId);
    setError("");
    setSaveMessage("");
    try {
      const response = await fetch(`http://localhost:8000/api/knowledge-bases/${knowledgeBaseId}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as SaveResponse;
      if (!response.ok) {
        throw new Error(payload.detail || "删除知识库失败。");
      }

      if (selectedBaseId === knowledgeBaseId) {
        setResult(null);
        setSelectedBaseId(null);
        setDocId(null);
        setFileHash("");
        setSourceFileName("");
        setMetaInfo("");
      }

      setSaveMessage(payload.message || "知识库已删除");
      await loadKnowledgeBases();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("删除知识库失败，请检查后端服务。");
      }
    } finally {
      setDeletingBaseId(null);
    }
  }

  function beginRenameKnowledgeBase(item: KnowledgeBaseItem) {
    setEditingBaseId(item.id);
    setEditingBaseName(item.name);
    setError("");
    setSaveMessage("");
  }

  function cancelRenameKnowledgeBase() {
    setEditingBaseId(null);
    setEditingBaseName("");
  }

  async function handleRenameKnowledgeBase(knowledgeBaseId: number) {
    const nextName = editingBaseName.trim();
    if (!nextName) {
      setError("请输入新的资料库名称。");
      return;
    }

    setRenamingBaseId(knowledgeBaseId);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(`http://localhost:8000/api/knowledge-bases/${knowledgeBaseId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: nextName }),
      });
      const payload = (await response.json()) as KnowledgeBaseRenameResponse;
      if (!response.ok) {
        throw new Error(payload.detail || "资料库名称更新失败。");
      }

      setKnowledgeBases((prev) =>
        prev.map((item) =>
          item.id === knowledgeBaseId
            ? {
                ...item,
                name: nextName,
                updated_at: payload.item?.updated_at ?? item.updated_at,
              }
            : item,
        ),
      );
      if (selectedBaseId === knowledgeBaseId) {
        setSourceFileName(nextName);
      }
      setSaveMessage(payload.message || "资料库名称已更新");
      cancelRenameKnowledgeBase();
      await loadKnowledgeBases();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("资料库名称更新失败，请检查后端服务。");
      }
    } finally {
      setRenamingBaseId(null);
    }
  }

  function focusKnowledgeBaseByIndex(index: number) {
      if (knowledgeBases.length === 0) return;
      const normalizedIndex = ((index % knowledgeBases.length) + knowledgeBases.length) % knowledgeBases.length;
    setCurrentBaseIndex(normalizedIndex);
    setLibraryRotation(normalizedIndex);
    }

  function handleLibraryWheel(event: Pick<WheelEvent, "preventDefault" | "deltaY" | "deltaX">) {
      if (knowledgeBases.length <= 1) return;
      event.preventDefault();
      const dominantDelta = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!dominantDelta) return;

      const deltaInCards = dominantDelta / 320;

      setLibraryRotation((prev) => {
        const next = prev + deltaInCards;
        const normalized = ((next % knowledgeBases.length) + knowledgeBases.length) % knowledgeBases.length;
        return normalized;
      });

      if (wheelSnapTimeoutRef.current) {
        window.clearTimeout(wheelSnapTimeoutRef.current);
      }

      wheelSnapTimeoutRef.current = window.setTimeout(() => {
        setLibraryRotation((prev) => {
          const snapped = Math.round(prev);
          const normalized = ((snapped % knowledgeBases.length) + knowledgeBases.length) % knowledgeBases.length;
          setCurrentBaseIndex(normalized);
          return normalized;
        });
      }, 140);
    }

  function renderTagSection(title: string, category: TagCategory, items: Experience[]) {
    const isSkill = category === "技能证书";
    const draftName = newTag.category === category ? newTag.name : "";
    const draftDetail = newTag.category === category ? newTag.detail : "";

    return (
      <section className="space-y-4" data-reveal style={revealStyle(isSkill ? 0 : 1)}>
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-violet-500/70">{isSkill ? "Skills" : "Certificates"}</p>
            <h3 className="text-xl font-semibold tracking-[0.02em] text-white">{title}</h3>
          </div>
          <p className="max-w-xl text-sm text-stone-500">
            {isSkill ? "技能条目改为 tag 展示，减少大段空字段。" : "语言证书集中展示，便于核对分数和等级。"}
          </p>
        </div>
        <div
          className="flashlight-card rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.24)] backdrop-blur"
          onMouseMove={handleCardPointerMove}
          onMouseLeave={handleCardPointerLeave}
        >
          <div className="mb-4 flex min-h-14 flex-wrap gap-3">
            {items.length === 0 ? (
              <div className="rounded-full border border-dashed border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-500">
                当前没有提取到 {title}，你可以手动补充。
              </div>
            ) : null}
            {items.map((item, index) => (
              <div
                key={`${category}-${index}-${item.name ?? "empty"}`}
                className="pill-button inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-2 shadow-sm"
              >
                <span className="text-sm font-medium text-stone-100">{item.name || "未命名"}</span>
                {item.achievement || item.description ? (
                  <span className="rounded-full bg-stone-950 px-2 py-0.5 text-xs text-stone-50">
                    {item.achievement || item.description}
                  </span>
                ) : null}
                <button
                  type="button"
                  className="text-stone-400 transition hover:text-violet-600"
                  onClick={() =>
                    setEditingTag({
                      category,
                      index,
                      name: item.name ?? "",
                      detail: String(item.achievement ?? item.description ?? ""),
                    })
                  }
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="text-stone-400 transition hover:text-rose-600"
                  onClick={() => removeTagExperience(category, index)}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)_220px_auto]">
            <div className="space-y-2">
              <Label>类别</Label>
              <Input value={category} readOnly className="bg-white/[0.03] text-stone-300" />
            </div>
            <div className="space-y-2">
              <Label>{isSkill ? "技能名称" : "证书名称"}</Label>
              <Input
                value={draftName}
                onChange={(event) => setNewTag({ category, name: event.target.value, detail: draftDetail })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isSkill ? "熟练程度" : "分数 / 等级"}</Label>
              <Input
                value={draftDetail}
                onChange={(event) => setNewTag({ category, name: draftName, detail: event.target.value })}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                className="pill-button w-full rounded-full border-violet-400/30 bg-white/[0.04] text-stone-100"
                onClick={() => addTag(category)}
              >
                <Plus className="mr-2 h-4 w-4" />
                新增
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <main className="knowledge-page relative min-h-screen overflow-hidden bg-[#09090f] px-4 py-4 text-stone-100 md:px-6 md:py-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(142,92,255,0.24),transparent_26%),radial-gradient(circle_at_85%_18%,rgba(142,92,255,0.16),transparent_22%),linear-gradient(180deg,#0c0b13_0%,#09090f_100%)]" />
      </div>
      <div className="ambient-neon" />

      <div className="relative mx-auto max-w-[1500px]">
        <section className="mb-6 rounded-[2rem] border border-violet-400/20 bg-black/35 px-6 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl" data-reveal style={revealStyle(0)}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
            <div>
              <p className="font-ui-latin inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-400/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.34em] text-violet-200">
                <Sparkles className="h-3.5 w-3.5" />
                ProfileFlow
              </p>
              <h1 className="mt-5 text-3xl font-semibold tracking-[0.03em] text-white md:text-4xl">
                ProfileFlow：你的个人履历知识库
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300">
                使用步骤：创建知识库 → 上传履历材料 → 校对确认 → 一键填充任何表格
              </p>
            </div>
            <div className="rounded-[1.7rem] border border-white/10 bg-white/5 p-5">
              <p className="font-ui-latin text-xs uppercase tracking-[0.32em] text-violet-300">Overview</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { label: "知识库", value: String(knowledgeBases.length).padStart(2, "0") },
                  { label: "文档", value: String(totalDocuments).padStart(2, "0") },
                  { label: "条目", value: String(totalExperiences + totalEducationRecords).padStart(2, "0") },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.2rem] border border-white/10 bg-black/30 px-3 py-4 text-center">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-stone-400">{item.label}</p>
                    <p className="font-ui-latin mt-2 text-2xl font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 xl:grid-cols-2 xl:items-stretch">
          <Card className="flashlight-card flex h-full min-h-[42rem] flex-col border-violet-400/16 bg-[#101019]/82 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl" onMouseMove={handleCardPointerMove} onMouseLeave={handleCardPointerLeave} data-reveal style={revealStyle(1)}>
            <CardHeader className="border-b border-white/8">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="font-ui-latin text-xs uppercase tracking-[0.34em] text-violet-300">Personal Library</p>
                  <CardTitle className="mt-2 text-2xl tracking-[0.02em] text-white">个人资料库</CardTitle>
                  <CardDescription className="text-stone-400">
                    在这里创建、切换、加载、编辑和删除“求职简历库”“升学知识库”等资料库。
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Input value={newBaseName} onChange={(event) => setNewBaseName(event.target.value)} placeholder="例如：求职简历库" className="min-w-[220px] bg-white/[0.05]" />
                  <div className="flex gap-3">
                    <Button className="pill-button rounded-full bg-violet-400 px-5 text-black hover:bg-violet-300" onClick={handleCreateKnowledgeBase} disabled={isCreatingBase}>
                      {isCreatingBase ? "创建中..." : "创建"}
                    </Button>
                    <Button variant="outline" className="pill-button rounded-full border-violet-400/30 bg-white/[0.04] px-5 text-stone-100" onClick={() => void loadKnowledgeBases()} disabled={isBaseLoading}>
                      {isBaseLoading ? "刷新中..." : "刷新"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pt-6">
              {knowledgeBases.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center text-sm text-stone-400">
                  当前还没有资料库，先创建一个，再开始上传和整理资料。
                </div>
              ) : (
                <div className="flex flex-1 flex-col space-y-4">
                  <div className="font-ui-mono rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-stone-400">
                    在卡片区域滚动滚轮可切换焦点卡片，点击“选择此库”后才会真正载入该资料库。
                  </div>
                  <div
                    ref={libraryStackRef}
                    className="library-stack relative flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-black/20"
                    onWheel={(event) => event.preventDefault()}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(168,133,255,0.24),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_38%,rgba(0,0,0,0.26)_100%)]" />
                    {knowledgeBases.map((item, index) => {
                      const total = knowledgeBases.length;
                      const focusedIndex = ((Math.round(libraryRotation) % total) + total) % total;
                      const angleStep = 360 / total;
                      let deltaIndex = index - libraryRotation;
                      if (deltaIndex > total / 2) deltaIndex -= total;
                      if (deltaIndex < -total / 2) deltaIndex += total;

                      const angle = deltaIndex * angleStep;
                      const radians = (angle * Math.PI) / 180;
                      const radiusX = 252;
                      const radiusZ = 220;
                      const x = Math.sin(radians) * radiusX;
                      const z = Math.cos(radians) * radiusZ;
                      const y = 0;
                      const absAngle = Math.abs(angle);
                      const isVisible = absAngle <= 140;
                      if (!isVisible) return null;

                      const basicInfo = item.data.basic_info;
                      const regularCount = (item.data.experiences ?? []).filter(
                        (entry) => entry.category !== "技能证书" && entry.category !== "语言证书",
                      ).length;
                      const skillCount = (item.data.experiences ?? []).filter((entry) => entry.category === "技能证书").length;
                      const languageCount = (item.data.experiences ?? []).filter((entry) => entry.category === "语言证书").length;
                      const isActive = index === focusedIndex;
                      const isSelected = selectedBaseId === item.id;
                      const focusRatio = (z + radiusZ) / (radiusZ * 2);
                      const scale = 0.72 + focusRatio * 0.3;
                      const cardOpacity = 0.26 + focusRatio * 0.82;
                      const cardFilter = `saturate(${0.58 + focusRatio * 0.56}) brightness(${0.54 + focusRatio * 0.5})`;
                      const transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z - radiusZ * 0.55}px) rotateY(${-angle * 0.72}deg) scale(${scale})`;
                      const detailOnLeft = index % 2 === 0;

                      return (
                        <article
                          key={item.id}
                          className={cn(
                            "flashlight-card absolute left-1/2 top-1/2 w-[min(100%-3rem,21rem)] rounded-[2rem] border transition-[transform,opacity,filter,box-shadow,border-color,background-color] duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
                            isActive
                              ? "border-violet-300/60 bg-white/[0.12] p-6 shadow-[0_24px_120px_rgba(168,133,255,0.24)]"
                              : "border-white/10 bg-white/[0.05] px-5 py-4 shadow-[0_16px_60px_rgba(0,0,0,0.28)]",
                          )}
                          style={{
                            transform,
                            zIndex: Math.round(1000 + z),
                            opacity: cardOpacity,
                            filter: cardFilter,
                          }}
                          onClick={() => focusKnowledgeBaseByIndex(index)}
                          onMouseMove={handleCardPointerMove}
                          onMouseLeave={handleCardPointerLeave}
                          >
                          <div className={cn("flex items-start gap-4", detailOnLeft ? "flex-row" : "flex-row-reverse")}>
                            <div className="min-w-0 flex-1">
                              {editingBaseId === item.id ? (
                                <div className="flex flex-col gap-3" onClick={(event) => event.stopPropagation()}>
                                  <Input
                                    value={editingBaseName}
                                    onChange={(event) => setEditingBaseName(event.target.value)}
                                    className="max-w-xs"
                                    placeholder="输入新的资料库名称"
                                  />
                                  <div className="flex flex-wrap gap-2">
                                    <Button className="pill-button rounded-full bg-violet-400 px-4 py-2 text-sm text-black hover:bg-violet-300" onClick={() => void handleRenameKnowledgeBase(item.id)} disabled={renamingBaseId === item.id}>
                                      {renamingBaseId === item.id ? "保存中..." : "保存库名"}
                                    </Button>
                                    <Button variant="outline" className="pill-button rounded-full border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-stone-100" onClick={cancelRenameKnowledgeBase} disabled={renamingBaseId === item.id}>
                                      取消
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <h3 className="text-xl tracking-[0.02em] text-white">{item.name}</h3>
                                  <button
                                    type="button"
                                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-violet-400/90 text-white transition hover:bg-violet-400"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      beginRenameKnowledgeBase(item);
                                    }}
                                    aria-label={`编辑 ${item.name} 的库名`}
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              )}
                              <p className="mt-2 text-sm text-stone-400">
                                {basicInfo.name || "未命名内容"} · 文档数 {item.document_count ?? 0} · 最近更新 {formatTimeLabel(item.updated_at)}
                              </p>
                            </div>
                            <div className={cn("flex shrink-0 flex-col gap-2", detailOnLeft ? "items-end" : "items-start")}>
                              <span className={cn(
                                "font-ui-latin rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em]",
                                isSelected
                                  ? "border border-emerald-300/40 bg-emerald-400/16 text-emerald-100"
                                  : isActive
                                    ? "border border-violet-300/40 bg-violet-400/16 text-violet-100"
                                    : "border border-white/10 bg-white/[0.04] text-stone-300",
                              )}>
                                {isSelected ? "Selected" : isActive ? "Focus" : angle < 0 ? "Left Arc" : "Right Arc"}
                              </span>
                              <span className="font-ui-mono text-[10px] uppercase tracking-[0.24em] text-stone-500">
                                #{String(index + 1).padStart(2, "0")}
                              </span>
                            </div>
                          </div>

                          {isActive ? (
                            <>
                              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-200">
                                <span className="rounded-full bg-black/30 px-3 py-1">教育 {item.data.education_history.length}</span>
                                <span className="rounded-full bg-black/30 px-3 py-1">经历 {regularCount}</span>
                                <span className="rounded-full bg-black/30 px-3 py-1">技能 {skillCount}</span>
                                <span className="rounded-full bg-black/30 px-3 py-1">语言 {languageCount}</span>
                              </div>

                              <p className="mt-4 text-sm text-stone-400">
                                {basicInfo.university || "未填写学校"}
                                {basicInfo.major ? ` · ${basicInfo.major}` : ""}
                                {basicInfo.current_status ? ` · ${basicInfo.current_status}` : ""}
                              </p>

                              <div className="mt-5 flex flex-wrap gap-3" onClick={(event) => event.stopPropagation()}>
                                <Button variant="outline" className="pill-button rounded-full border-violet-400/30 bg-white/[0.04] px-5 text-stone-100" onClick={() => loadKnowledgeItem(item)}>
                                  选择此库
                                </Button>
                                <Button variant="outline" className="pill-button rounded-full border-rose-400/30 bg-rose-400/10 px-5 text-rose-100" onClick={() => void handleDeleteKnowledgeRecord(item.id)} disabled={deletingBaseId === item.id}>
                                  {deletingBaseId === item.id ? "删除中..." : "删除"}
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="mt-3 h-9 overflow-hidden">
                              <p className="truncate text-sm text-stone-300">
                                {item.name}
                              </p>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="flashlight-card flex h-full min-h-[42rem] flex-col border-violet-400/16 bg-[#101019]/82 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl" onMouseMove={handleCardPointerMove} onMouseLeave={handleCardPointerLeave} data-reveal style={revealStyle(3)}>
            <CardHeader className="border-b border-white/8">
              <p className="font-ui-latin text-xs uppercase tracking-[0.34em] text-violet-300">Template Fill</p>
              <CardTitle className="mt-2 text-2xl tracking-[0.02em] text-white">一键填表</CardTitle>
              <CardDescription className="text-stone-400">
                上传带有占位符的 Word 模板，例如 <code className="font-ui-mono">{"{{basic_info.name}}"}</code>、<code className="font-ui-mono">{"{{education_history[0].major}}"}</code>、
                <code className="font-ui-mono">{"{{experiences[0].achievement}}"}</code>，系统会用当前知识库内容自动替换并下载新文档。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4 pt-6">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
                <div className="rounded-[1.8rem] border border-dashed border-violet-400/28 bg-white/[0.04] p-5">
                  <Label className="mb-3 block text-stone-200">Word 申请表模板</Label>
                  <input
                    type="file"
                    accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(event) => handleTemplateFileSelect(event.target.files?.[0] ?? null)}
                    className="block w-full text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-violet-400 file:px-4 file:py-2 file:text-sm file:font-medium file:text-black"
                  />
                  <p className="mt-3 text-sm text-stone-400">
                    {templateFile ? `已选择模板：${templateFile.name}` : "请上传一个 DOC 或 DOCX 模板文件。"}
                  </p>
                </div>
                <div className="flex items-end">
                  <Button
                    className="pill-button h-11 rounded-full bg-violet-400 px-6 text-black hover:bg-violet-300"
                    onClick={handleFillTemplate}
                    disabled={!selectedBaseId || !templateFile || isFillingTemplate}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {isFillingTemplate ? "填充中..." : "一键填充"}
                  </Button>
                </div>
              </div>

              {templateMessage ? (
                <div className="rounded-[1.4rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  {templateMessage}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <Card className="flashlight-card sticky top-4 h-fit border-violet-400/16 bg-[#101019]/88 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl" onMouseMove={handleCardPointerMove} onMouseLeave={handleCardPointerLeave} data-reveal style={revealStyle(4)}>
            <CardHeader className="border-b border-white/8">
              <p className="font-ui-latin text-xs uppercase tracking-[0.34em] text-violet-300">Material Input</p>
              <CardTitle className="mt-2 text-2xl tracking-[0.02em] text-white">资料上传</CardTitle>
              <CardDescription className="text-stone-400">支持文件拖拽上传与直接文本输入，两种方式共用同一条解析链路。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="grid grid-cols-2 gap-3 rounded-full bg-black/35 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("file");
                    setError("");
                  }}
                  className={[
                    "rounded-full px-4 py-2.5 text-sm font-medium transition",
                    inputMode === "file" ? "bg-violet-400 text-black shadow-sm" : "text-stone-400 hover:text-stone-200",
                  ].join(" ")}
                >
                  文件上传
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("text");
                    setError("");
                  }}
                  className={[
                    "rounded-full px-4 py-2.5 text-sm font-medium transition",
                    inputMode === "text" ? "bg-violet-400 text-black shadow-sm" : "text-stone-400 hover:text-stone-200",
                  ].join(" ")}
                >
                  直接文本
                </button>
              </div>

              {inputMode === "file" ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={[
                    "group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[1.8rem] border border-dashed p-6 text-center transition-all",
                    isDragging
                      ? "border-violet-400 bg-violet-400/10 shadow-inner"
                      : "border-white/14 bg-white/[0.03] hover:border-violet-400/50 hover:bg-white/[0.05]",
                  ].join(" ")}
                >
                  <input
                    type="file"
                    accept="image/*,application/pdf,.docx,.txt,text/plain"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={(event) => handleSelectFile(event.target.files?.[0] ?? null)}
                  />

                  {file ? (
                    <div className="flex w-full flex-col items-center gap-4">
                      {isImage && previewUrl ? (
                        <img src={previewUrl} alt="文件预览" className="h-44 w-full rounded-[1.4rem] object-cover shadow-md" />
                      ) : (
                        <div className="flex h-32 w-full items-center justify-center rounded-[1.4rem] bg-black text-white shadow-md">
                          <FileText className="mr-3 h-7 w-7" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                      )}

                      <div className="w-full rounded-[1.4rem] border border-white/10 bg-black/30 px-4 py-3 text-left shadow-sm">
                        <p className="truncate text-sm font-medium text-stone-100">{file.name}</p>
                        <p className="mt-1 text-xs text-stone-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 rounded-[1.4rem] bg-violet-400 p-4 text-black shadow-lg shadow-violet-950/15">
                        <Upload className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-semibold text-stone-100">拖拽文件到这里</h3>
                      <p className="mt-2 text-sm text-stone-400">支持图片、PDF、DOCX、TXT，也可以点击直接选择</p>
                      <p className="mt-5 inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-stone-400 shadow-sm">
                        <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
                        PNG / JPG / PDF / DOCX / TXT
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 shadow-sm">
                  <div className="mb-4 flex items-center text-stone-100">
                    <Type className="mr-2 h-4 w-4" />
                    <span className="text-sm font-medium">直接输入文本材料</span>
                  </div>
                  <Textarea
                    value={textInput}
                    onChange={(event) => setTextInput(event.target.value)}
                    placeholder="例如：技能：熟练使用 SQL、SPSS、Adobe 系列；语言：CET-4 597，CET-6 545。"
                    className="min-h-[260px] rounded-2xl bg-white/[0.04]"
                  />
                </div>
              )}

              {error ? (
                <div className="rounded-[1.4rem] border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{error}</div>
              ) : null}

              {saveMessage ? (
                <div className="rounded-[1.4rem] border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                  {saveMessage}
                </div>
              ) : null}

              <Button
                className="pill-button h-11 w-full rounded-full bg-violet-400 text-black shadow-lg shadow-violet-950/20 hover:bg-violet-300"
                onClick={handleParse}
                disabled={
                  isLoading ||
                  !selectedBaseId ||
                  (inputMode === "file" && !file) ||
                  (inputMode === "text" && !textInput.trim())
                }
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "解析中..." : "开始解析"}
              </Button>
            </CardContent>
          </Card>

          <Card className="flashlight-card border-violet-400/16 bg-[#101019]/88 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl" onMouseMove={handleCardPointerMove} onMouseLeave={handleCardPointerLeave} data-reveal style={revealStyle(5)}>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <p className="font-ui-latin text-xs uppercase tracking-[0.34em] text-violet-300">Preview & Edit</p>
                <CardTitle className="mt-2 text-2xl tracking-[0.02em] text-white">解析结果预览与编辑区</CardTitle>
                <CardDescription className="text-stone-400">
                  {selectedBaseId
                    ? `当前正在编辑知识库 #${selectedBaseId} 中的内容，支持手动校对、增删改后再保存入库。`
                    : "请先在上方选择目标知识库，再开始解析与保存。"}
                </CardDescription>
                {metaInfo ? <p className="font-ui-mono mt-2 text-xs text-stone-500">{metaInfo}</p> : null}
              </div>
              <Button
                variant="outline"
                className="pill-button rounded-full border-violet-400/30 bg-white/[0.04] px-5 text-stone-100"
                onClick={handleSave}
                disabled={!result || isSaving || !selectedBaseId}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "保存中..." : "保存入库"}
              </Button>
            </CardHeader>
            <CardContent>
              {!result ? (
                <div className="flex min-h-[640px] flex-col items-center justify-center rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.03] px-6 text-center">
                  <div className="mb-4 rounded-[1.4rem] bg-black/30 p-4 shadow-sm">
                    <FileText className="h-8 w-8 text-violet-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">等待解析结果</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-stone-400">
                    左侧上传文件或直接粘贴文本，解析完成后会在这里展示结构化履历结果。
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold tracking-[0.02em] text-white">基础信息</h3>
                      <p className="mt-1 text-sm text-stone-400">补充与修正个人基础资料。</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      {basicFields.map((field) => (
                        <div className="space-y-2" key={field.key}>
                          <Label>{field.label}</Label>
                          <Input value={result.basic_info[field.key] ?? ""} onChange={(event) => updateBasicInfo(field.key, event.target.value)} />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold tracking-[0.02em] text-white">教育经历</h3>
                        <p className="mt-1 text-sm text-stone-400">维护学校、专业、学位、GPA 和课程等信息。</p>
                      </div>
                      <Button variant="outline" className="pill-button rounded-full border-violet-400/30 bg-white/[0.04] px-5 text-stone-100" onClick={addEducation}>
                        <Plus className="mr-2 h-4 w-4" />
                        新增教育经历
                      </Button>
                    </div>

                    {result.education_history.length === 0 ? (
                      <div className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center text-sm text-stone-400">
                        当前没有提取到教育经历，你可以手动新增一条。
                      </div>
                    ) : null}

                    {result.education_history.map((education, index) => (
                      <Card key={`education-${index}`} className="flashlight-card rounded-[1.8rem] border-white/10 bg-black/20 shadow-sm" onMouseMove={handleCardPointerMove} onMouseLeave={handleCardPointerLeave}>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                          <CardTitle className="text-base text-white">教育经历 #{index + 1}</CardTitle>
                          <Button variant="outline" className="pill-button h-9 rounded-full border-white/10 bg-white/[0.04] px-3 text-stone-300 hover:text-rose-300" onClick={() => removeEducation(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>学校名称</Label>
                            <Input value={education.institution ?? ""} onChange={(event) => updateEducation(index, { institution: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>专业</Label>
                            <Input value={education.major ?? ""} onChange={(event) => updateEducation(index, { major: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>学位</Label>
                            <Input value={education.degree ?? ""} onChange={(event) => updateEducation(index, { degree: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>GPA</Label>
                            <Input value={education.gpa ?? ""} onChange={(event) => updateEducation(index, { gpa: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>开始时间</Label>
                            <Input value={education.start_date ?? ""} onChange={(event) => updateEducation(index, { start_date: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>结束时间</Label>
                            <Input value={education.end_date ?? ""} onChange={(event) => updateEducation(index, { end_date: event.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>排名</Label>
                            <Input value={education.ranking ?? ""} onChange={(event) => updateEducation(index, { ranking: event.target.value })} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label>课程列表</Label>
                            <Textarea
                              value={education.courses.join("、")}
                              onChange={(event) => updateEducation(index, { courses: parseCourses(event.target.value) })}
                              className="min-h-[96px]"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </section>

                  {renderTagSection("技能标签", "技能证书", skillExperiences)}
                  {renderTagSection("语言证书", "语言证书", languageExperiences)}

                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold tracking-[0.02em] text-white">经历条目</h3>
                        <p className="mt-1 text-sm text-stone-400">这里保留除技能证书、语言证书之外的结构化经历。</p>
                      </div>
                      <Button variant="outline" className="pill-button rounded-full border-violet-400/30 bg-white/[0.04] px-5 text-stone-100" onClick={addExperience}>
                        <Plus className="mr-2 h-4 w-4" />
                        新增经历
                      </Button>
                    </div>

                    {regularExperiences.length === 0 ? (
                      <div className="rounded-[1.8rem] border border-dashed border-white/12 bg-white/[0.03] px-6 py-10 text-center text-sm text-stone-400">
                        当前没有常规经历条目，你可以手动新增。
                      </div>
                    ) : null}

                    {regularExperiences.map((experience, index) => (
                      <Card key={`experience-${index}`} className="flashlight-card rounded-[1.8rem] border-white/10 bg-black/20 shadow-sm" onMouseMove={handleCardPointerMove} onMouseLeave={handleCardPointerLeave}>
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                          <CardTitle className="text-base text-white">经历 #{index + 1}</CardTitle>
                          <Button variant="outline" className="pill-button h-9 rounded-full border-white/10 bg-white/[0.04] px-3 text-stone-300 hover:text-rose-300" onClick={() => removeRegularExperience(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                          {experienceFields.map((field) => (
                            <div key={field.key} className={field.textarea ? "space-y-2 md:col-span-2" : "space-y-2"}>
                              <Label>{field.label}</Label>
                              {field.textarea ? (
                                <Textarea
                                  value={experience[field.key] ?? ""}
                                  onChange={(event) => updateRegularExperience(index, { [field.key]: event.target.value })}
                                  className="min-h-[120px]"
                                />
                              ) : (
                                <Input
                                  value={experience[field.key] ?? ""}
                                  onChange={(event) => updateRegularExperience(index, { [field.key]: event.target.value })}
                                />
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </section>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>

      {editingTag ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="flashlight-card w-full max-w-lg rounded-[2rem] border border-violet-400/20 bg-[#101019] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="font-ui-latin text-xs uppercase tracking-[0.34em] text-violet-300">Edit Tag</p>
                <h3 className="mt-2 text-lg font-semibold tracking-[0.02em] text-white">编辑 tag</h3>
                <p className="mt-1 text-sm text-stone-400">
                  {editingTag.category === "技能证书" ? "修改技能名称与熟练程度。" : "修改语言证书名称与分数。"}
                </p>
              </div>
              <button
                type="button"
                className="rounded-full p-2 text-stone-400 transition hover:bg-white/10 hover:text-white"
                onClick={() => setEditingTag(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{editingTag.category === "技能证书" ? "技能名称" : "证书名称"}</Label>
                <Input value={editingTag.name} onChange={(event) => setEditingTag({ ...editingTag, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{editingTag.category === "技能证书" ? "熟练程度" : "分数 / 等级"}</Label>
                <Input value={editingTag.detail} onChange={(event) => setEditingTag({ ...editingTag, detail: event.target.value })} />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" className="pill-button rounded-full border-white/10 bg-white/[0.04] px-5 text-stone-100" onClick={() => setEditingTag(null)}>
                取消
              </Button>
              <Button className="pill-button rounded-full bg-violet-400 px-5 text-black hover:bg-violet-300" onClick={saveTagEdit}>
                保存修改
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
