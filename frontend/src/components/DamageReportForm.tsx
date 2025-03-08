"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  workorder_number: z
    .string()
    .min(1, { message: "Please enter a workorder number" })
    .regex(/^\d+$/, { message: "Workorder number must contain only digits" }),
  item: z.string().min(1, { message: "Please select an item" }),
  item_code: z.string(),
  subitem: z.string().min(1, { message: "Please select a subitem" }),
  subitem_code: z.string(),
  damage: z.string().min(1, { message: "Please select a damage type" }),
  damage_code: z.string(),
  severity: z.string().min(1, { message: "Please select a severity level" }),
  severity_code: z.string(),
  action: z.string().min(1, { message: "Please select an action" }),
  action_code: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function DamageReportForm() {
  // Item to code mapping with proper typing
  const itemCodes: Record<string, string> = {
    "Air Suspension": "AS001",
    Engine: "ENG001",
    "LF Strut": "STR001",
    "Air Conditioner": "AC001",
    "RF Tire": "TRF001",
    "LF Tire": "TLF001",
    "Air Filter": "FLT001",
    "Oil Filter": "FLT002",
    Oil: "OIL001",
    "Transmission Filter": "FLT003",
  };

  const subitemCodes: Record<string, string> = {
    Chair: "CH001",
    Table: "TB001",
    Computer: "CP001",
    Phone: "PH001",
    Car: "CR001",
    Wall: "WL001",
  };

  const damageCodes: Record<string, string> = {
    Broken: "BR001",
    Scratched: "SC001",
    Dented: "DT001",
    Cracked: "CR001",
    "Water Damage": "WD001",
  };

  const severityCodes: Record<string, string> = {
    Minor: "MN001",
    Moderate: "MD001",
    Major: "MA001",
    Critical: "CR001",
  };

  const actionCodes: Record<string, string> = {
    Repair: "RP001",
    Replace: "RP002",
    Clean: "CL001",
    Inspect: "IN001",
    "No Action Required": "NA001",
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workorder_number: "",
      item: "",
      item_code: "",
      subitem: "",
      subitem_code: "",
      damage: "",
      damage_code: "",
      severity: "",
      severity_code: "",
      action: "",
      action_code: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setMessage(null);

    console.log("Submitting with item code:", data.item_code);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/submit`, data);

      setMessage({
        text: "Damage report submitted successfully!",
        type: "success",
      });

      form.reset();
    } catch (error) {
      console.error("Submission error:", error);

      if (axios.isAxiosError(error) && error.response) {
        setMessage({
          text: `Error: ${
            error.response.data.error || "Failed to submit form"
          }`,
          type: "error",
        });
      } else {
        setMessage({
          text: "Error connecting to the server",
          type: "error",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-orange-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
          Damage Report Form
        </h1>
        <p className="text-muted-foreground text-center mt-2">
          Please fill out the form below to report damage
        </p>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="workorder_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workorder Number</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Enter workorder number"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("item_code", itemCodes[value] || "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an item" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Air Suspension">
                      Air Suspension
                    </SelectItem>
                    <SelectItem value="Engine">Engine</SelectItem>
                    <SelectItem value="LF Strut">LF Strut</SelectItem>
                    <SelectItem value="Air Conditioner">
                      Air Conditioner
                    </SelectItem>
                    <SelectItem value="RF Tire">RF Tire</SelectItem>
                    <SelectItem value="LF Tire">LF Tire</SelectItem>
                    <SelectItem value="Air Filter">Air Filter</SelectItem>
                    <SelectItem value="Oil Filter">Oil Filter</SelectItem>
                    <SelectItem value="Oil">Oil</SelectItem>
                    <SelectItem value="Transmission Filter">
                      Transmission Filter
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="subitem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subitem</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("subitem_code", subitemCodes[value] || "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subitem" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="chair">Chair</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="computer">Computer</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="wall">Wall</SelectItem>
                    <SelectItem value="door">Door</SelectItem>
                    <SelectItem value="tool">Tool</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="damage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Damage Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("damage_code", damageCodes[value] || "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select damage type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="broken">Broken</SelectItem>
                    <SelectItem value="scratched">Scratched</SelectItem>
                    <SelectItem value="dented">Dented</SelectItem>
                    <SelectItem value="cracked">Cracked</SelectItem>
                    <SelectItem value="water_damage">Water Damage</SelectItem>
                    <SelectItem value="electrical_issue">
                      Electrical Issue
                    </SelectItem>
                    <SelectItem value="missing_parts">Missing Parts</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("severity_code", severityCodes[value] || "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="minor">Minor</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="major">Major</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="action"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommended Action</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("action_code", actionCodes[value] || "");
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recommended action" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="replace">Replace</SelectItem>
                    <SelectItem value="clean">Clean</SelectItem>
                    <SelectItem value="inspect">Inspect Further</SelectItem>
                    <SelectItem value="no_action">
                      No Action Required
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-all duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
