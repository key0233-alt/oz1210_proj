/**
 * @file components/feedback-form.tsx
 * @description 피드백 폼 컴포넌트
 *
 * 피드백 유형 선택, 내용 입력, 이메일 입력을 포함하는 폼입니다.
 * react-hook-form과 Zod를 사용하여 유효성 검사를 수행합니다.
 */

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback } from "@/lib/api/feedback-api";
import { toast } from "sonner";

const feedbackSchema = z.object({
  type: z.enum(["bug", "suggestion", "other"], {
    required_error: "피드백 유형을 선택해주세요.",
  }),
  content: z
    .string()
    .min(10, "피드백 내용은 최소 10자 이상 입력해주세요.")
    .max(1000, "피드백 내용은 최대 1000자까지 입력 가능합니다."),
  email: z.string().email("올바른 이메일 주소를 입력해주세요.").optional().or(z.literal("")),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface FeedbackFormProps {
  onSuccess?: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: undefined,
      content: "",
      email: "",
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      await submitFeedback({
        type: data.type,
        content: data.content,
        email: data.email || undefined,
      });
      toast.success("피드백이 성공적으로 전송되었습니다. 감사합니다!");
      form.reset();
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "피드백 전송에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>피드백 유형</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="피드백 유형을 선택해주세요" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bug">버그 리포트</SelectItem>
                  <SelectItem value="suggestion">기능 제안</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                피드백의 유형을 선택해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>피드백 내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="피드백 내용을 입력해주세요..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                최소 10자 이상 입력해주세요. ({field.value.length}/1000)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>이메일 (선택 사항)</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                답변을 받으시려면 이메일을 입력해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              onSuccess?.();
            }}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "전송 중..." : "전송"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

