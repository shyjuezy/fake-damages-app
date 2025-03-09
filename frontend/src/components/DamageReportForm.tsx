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
import Loading from "@/app/Loading";

const formSchema = z.object({
  work_order_number: z
    .string()
    .min(1, { message: "Please enter a workorder number" })
    .regex(/^\d+$/, { message: "Workorder number must contain only digits" }),
  item: z.string().min(1, { message: "Please select an item" }),
  item_code: z.string(),
  subitem: z.string().min(1, { message: "Please select a subitem" }),
  sub_item_code: z.string(),
  damage: z.string().min(1, { message: "Please select a damage type" }),
  damage_code: z.string(),
  severity: z.string().min(1, { message: "Please select a severity level" }),
  severity_code: z.string(),
  action: z.string().min(1, { message: "Please select an action" }),
  action_code: z.string(),
  site_id: z.string().min(1, { message: "Please select a site" }),
});

type FormValues = z.infer<typeof formSchema>;

export function DamageReportForm() {
  // Item to code mapping with proper typing
  const itemCodes: Record<string, string> = {
    "Air Suspension": "0520",
    Engine: "0530",
    "LF Strut": "0620",
    "Air Conditioner": "0630",
    "RF Tire": "0640",
    "LF Tire": "0650",
    "Air Filter": "0660",
    "Oil Filter": "0670",
    Oil: "0680",
    "Transmission Filter": "0690",
  };

  const subitemCodes: Record<string, string> = {
    "01": "01",
    "02": "02",
    "03": "03",
    "04": "04",
    "05": "05",
    "06": "06",
    "07": "07",
  };

  const damageCodes: Record<string, string> = {
    Broken: "BR",
    Missing: "MI",
    Bent: "BE",
    Cracked: "CR",
    Leak: "LK",
  };

  const severityCodes: Record<string, string> = {
    "Replacement Required": "RQ",
  };

  const actionCodes: Record<string, string> = {
    Repair: "RE",
    Replace: "RP",
    "In-Body": "IB",
    "Part Needed": "PN",
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Helper function to safely interact with localStorage
  const getLocalStorage = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("recentWorkorders");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  };

  const setLocalStorage = (workorders: string[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("recentWorkorders", JSON.stringify(workorders));
    }
  };

  // Add state for recent workorders
  const [recentWorkorders, setRecentWorkorders] = useState<string[]>(() => {
    return getLocalStorage();
  });
  const [showRecentWorkorders, setShowRecentWorkorders] = useState(false);

  // Function to add a new workorder to recent list
  const addToRecentWorkorders = (workorderNumber: string) => {
    const updated = [
      workorderNumber,
      ...recentWorkorders.filter((wo) => wo !== workorderNumber),
    ].slice(0, 5);
    setRecentWorkorders(updated);
    setLocalStorage(updated);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      work_order_number: "",
      item: "",
      item_code: "",
      subitem: "",
      sub_item_code: "",
      damage: "",
      damage_code: "",
      severity: "",
      severity_code: "",
      action: "",
      action_code: "",
      site_id: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setMessage(null);

    console.log("Submitting with item code:", data.item_code);

    try {
      const response = await axios.post("/api/submit", data);

      if (response.status === 201 || response.status === 200) {
        // Add to recent workorders after successful submission
        addToRecentWorkorders(data.work_order_number);

        setMessage({
          text: "Damage report submitted successfully!",
          type: "success",
        });

        // Reset form with default values
        const defaultValues = {
          work_order_number: "",
          item: "",
          item_code: "",
          subitem: "",
          sub_item_code: "",
          damage: "",
          damage_code: "",
          severity: "",
          severity_code: "",
          action: "",
          action_code: "",
          site_id: "",
        };

        // Reset the form state completely
        form.reset(defaultValues);
      }
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
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-orange-100">
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
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <FormField
              control={form.control}
              name="work_order_number"
              render={({ field }) => (
                <FormItem className="w-full relative">
                  <FormLabel>Workorder Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="Enter workorder number"
                        {...field}
                        onFocus={() => {
                          setShowRecentWorkorders(true);
                        }}
                        onBlur={() => {
                          // Delay hiding to allow clicking on the dropdown
                          setTimeout(() => setShowRecentWorkorders(false), 200);
                        }}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          field.onChange(value);
                        }}
                      />
                      {showRecentWorkorders && recentWorkorders.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                          <div className="py-1">
                            <div className="px-3 py-2 text-xs text-gray-500 border-b">
                              Recent Workorders
                            </div>
                            {recentWorkorders.map((workorder) => (
                              <div
                                key={workorder}
                                className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  field.onChange(workorder);
                                  setShowRecentWorkorders(false);
                                }}
                              >
                                {workorder}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="site_id"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Site ID</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a site" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="PLM1">PLM1</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Item</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("item_code", itemCodes[value] || "");
                    }}
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
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
                <FormItem className="w-full">
                  <FormLabel>Subitem</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("sub_item_code", subitemCodes[value] || "");
                    }}
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a subitem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="01">01</SelectItem>
                      <SelectItem value="02">02</SelectItem>
                      <SelectItem value="03">03</SelectItem>
                      <SelectItem value="04">04</SelectItem>
                      <SelectItem value="05">05</SelectItem>
                      <SelectItem value="06">06</SelectItem>
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
                <FormItem className="w-full">
                  <FormLabel>Damage Type</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("damage_code", damageCodes[value] || "");
                    }}
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select damage type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Broken">Broken</SelectItem>
                      <SelectItem value="Missing">Missing</SelectItem>
                      <SelectItem value="Bent">Bent</SelectItem>
                      <SelectItem value="Cracked">Cracked</SelectItem>
                      <SelectItem value="Leak">Leak</SelectItem>
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
                <FormItem className="w-full">
                  <FormLabel>Severity</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue(
                        "severity_code",
                        severityCodes[value] || ""
                      );
                    }}
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select severity level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Replacement Required">
                        Replacement Required
                      </SelectItem>
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
                <FormItem className="w-full">
                  <FormLabel>Recommended Action</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      form.setValue("action_code", actionCodes[value] || "");
                    }}
                    value={field.value}
                  >
                    <FormControl className="w-full">
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select recommended action" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Replace">Replace</SelectItem>
                      <SelectItem value="In-Body">In-Body</SelectItem>
                      <SelectItem value="Part Needed">Part Needed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="w-1/2 justify-self-end mt-4">
            <Button
              type="submit"
              className="w-full relative overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 transition-colors duration-300 ease-in-out transform hover:scale-[1.02] cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loading /> : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
