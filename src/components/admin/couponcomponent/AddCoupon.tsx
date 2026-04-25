import { createCoupon, updateCoupon } from "@/actions/couponActions";
import { getAllCustomers } from "@/actions/customerActions";
import { CouponFormState } from "@/types/types";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { DateRange, RangeKeyDict } from "react-date-range";

import AsyncSelect from "react-select/async";

interface AddCouponProps {
  mode?: "create" | "edit";
  initialData?: CouponFormState | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  fetchData?: any;
}

type Range = {
  startDate?: Date;
  endDate?: Date;
  key?: string;
};

const AddCoupon: React.FC<AddCouponProps> = ({
  mode = "create",
  initialData,
  onSuccess,
  onCancel,
  fetchData,
}) => {
  const [userType, setUserType] = useState<"all" | "individual">("all");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CouponFormState>({
    coupon_id: initialData?.coupon_id || "",
    coupon_title: initialData?.coupon_title || "",
    coupon_code: initialData?.coupon_code || "",
    coupon_type: initialData?.coupon_type || "percentage",
    coupon_startDate: initialData?.coupon_startDate || "",
    coupon_ExpiryDate: initialData?.coupon_ExpiryDate || "",
    coupon_value: initialData?.coupon_value || "",
    minimum_booking_value: initialData?.minimum_booking_value || "",
    coupon_uses_limit: initialData?.coupon_uses_limit || "",
    users_type: initialData?.users_type || "all",
    user_name: initialData?.user_name || [],
    status: initialData?.status ?? true,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState<Range[]>([
    {
      startDate: formData.coupon_startDate
        ? new Date(formData.coupon_startDate)
        : new Date(),
      endDate: formData.coupon_ExpiryDate
        ? new Date(formData.coupon_ExpiryDate)
        : new Date(),
      key: "selection",
    },
  ]);

  const [selectedCustomerOptions, setSelectedCustomerOptions] = useState<any[]>(
    []
  );

  useEffect(() => {
    if (!initialData) return;
    setFormData((prev) => ({
      ...prev,
      coupon_id: initialData.coupon_id,
      coupon_title: initialData.coupon_title,
      coupon_code: initialData.coupon_code,
      coupon_type: initialData.coupon_type || "percentage",
      coupon_startDate: initialData.coupon_startDate || "",
      coupon_ExpiryDate: initialData.coupon_ExpiryDate || "",
      coupon_value: initialData.coupon_value || "",
      minimum_booking_value: initialData.minimum_booking_value || "",
      coupon_uses_limit: initialData.coupon_uses_limit || "",
      users_type: initialData.users_type || "all",
      user_name: initialData.user_name || [],
      status: initialData.status ?? true,
    }));
    setUserType(initialData.users_type === "individual" ? "individual" : "all");
    setDateRange([
      {
        startDate: initialData.coupon_startDate
          ? new Date(initialData.coupon_startDate)
          : new Date(),
        endDate: initialData.coupon_ExpiryDate
          ? new Date(initialData.coupon_ExpiryDate)
          : new Date(),
        key: "selection",
      },
    ]);
  }, [initialData]);

  const formatDateToYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleDateRangeChange = (ranges: RangeKeyDict) => {
    const { startDate, endDate } = ranges.selection;

    setDateRange([ranges.selection]);

    if (!startDate || !endDate) return;

    setFormData((prev) => ({
      ...prev,
      coupon_startDate: formatDateToYYYYMMDD(startDate),
      coupon_ExpiryDate: formatDateToYYYYMMDD(endDate),
    }));
    setShowDatePicker(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelection = (value: string) => {
    setUserType(value as "all" | "individual");

    setFormData((prev) => ({
      ...prev,
      users_type: value,
      user_name: value === "all" ? [] : prev.user_name,
    }));
  };

  useEffect(() => {
    if (!initialData) {
      setSelectedCustomerOptions([]);
      return;
    }

    const opts =
      initialData.user_name?.map((u: any) => {
        const cust = u.user_name;
        if (cust && typeof cust === "object" && cust.name) {
          return {
            value: cust._id?.toString?.() ?? "",
            label: `${cust.name} (${cust.mobile_number ?? ""})`,
          };
        }
        return {
          value: String(cust),
          label: String(cust),
        };
      }) || [];

  setSelectedCustomerOptions(opts);
  }, [initialData]);

  const loadOptions = (
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (!inputValue.trim()) {
        callback([]);
        return;
      }

      try {
        const res = await getAllCustomers({
          page: 1,
          limit: 20,
          searchTerm: inputValue,
        });

        if (!res?.success) {
          callback([]);
          return;
        }

        const options = res.data.map((cus: any) => ({
          value: cus._id.toString(),
          label: `${cus.name} (${cus.mobile_number})`,
        }));
        callback(options);
      } catch (error) {
        console.error(error);
        callback([]);
      }
    }, 600);
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (!formData.coupon_startDate || !formData.coupon_ExpiryDate) {
        setError("Please select coupon validity period");
        setSubmitting(false);
        return;
      }

      const start = new Date(formData.coupon_startDate);
      const end = new Date(formData.coupon_ExpiryDate);
      const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        setError("Coupon duration must be at least 24 hours");
        setSubmitting(false);
        return;
      }

      const payload: CouponFormState = {
        ...formData,
        users_type: userType,
        user_name: userType === "all" ? [] : formData.user_name,
      };

      let res;
      if (mode === "edit" && formData.coupon_id) {
        res = await updateCoupon(formData.coupon_id, payload);
      } else {
        res = await createCoupon(payload);
      }

      if (!res?.success) {
        setError(res?.error || "Failed to create coupon");
        return;
      }

      if (mode === "create") {
        setFormData({
          coupon_id: "",
          coupon_title: "",
          coupon_code: "",
          coupon_type: "percentage",
          coupon_startDate: "",
          coupon_ExpiryDate: "",
          coupon_value: "",
          minimum_booking_value: "",
          coupon_uses_limit: "",
          users_type: "all",
          user_name: [],
          status: true,
        });
        setUserType("all");
        setDateRange([
          {
            startDate: new Date(),
            endDate: new Date(),
            key: "selection",
          },
        ]);
      }

      onSuccess?.();
      fetchData();
    } catch (err) {
      console.error(err);
      setError("Something went wrong while creating coupon");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-6 py-4">
      <h3 className="text-site-black xl:text-xl md:text-base text-sm font-bold">
        {mode === "edit" ? "Edit Coupon" : "Add Coupon"}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              name="coupon_title"
              value={formData.coupon_title}
              onChange={handleChange}
              placeholder="Enter coupon title"
              autoComplete="true"
              className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray"
            />
          </div>

          <div>
            <input
              type="text"
              name="coupon_code"
              value={formData.coupon_code}
              onChange={handleChange}
              placeholder="Coupon Code"
              className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray"
            />
          </div>

          <div>
            <select
              name="coupon_type"
              value={formData.coupon_type}
              onChange={handleChange}
              className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat</option>
            </select>
          </div>

          <div className="relative">
            <div
              className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray flex items-center justify-between cursor-pointer"
              onClick={() => setShowDatePicker((prev) => !prev)}
            >
              <span
                className={
                  formData.coupon_startDate && formData.coupon_ExpiryDate
                    ? "text-black"
                    : "text-gray-400"
                }
              >
                {formData.coupon_startDate && formData.coupon_ExpiryDate
                  ? `${formData.coupon_startDate} to ${formData.coupon_ExpiryDate}`
                  : "Validity (Date Range)"}
              </span>

              <span className="text-lg">📅</span>
            </div>

            {showDatePicker && (
              <div className="absolute z-50 mt-2 bg-white shadow-lg rounded-md">
                <DateRange
                  ranges={dateRange}
                  onChange={handleDateRangeChange}
                  moveRangeOnFirstSelection={false}
                  editableDateInputs={true}
                  rangeColors={["#7e8900"]}
                />
              </div>
            )}
          </div>

          <div>
            <input
              type="text"
              name="coupon_value"
              value={formData.coupon_value}
              onChange={handleChange}
              placeholder="Enter value"
              className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray"
            />
          </div>

          <div>
            <input
              type="text"
              name="minimum_booking_value"
              value={formData.minimum_booking_value}
              onChange={handleChange}
              placeholder="Minimum Booking  Value"
              className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray"
            />
          </div>

          <div>
            <input
              type="text"
              name="coupon_uses_limit"
              value={formData.coupon_uses_limit}
              onChange={handleChange}
              placeholder="Coupon Usage Limit"
              className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray"
            />
          </div>

          <div className="md:col-span-2">
            <div className="w-full">
              <select
                value={userType}
                onChange={(e) => handleUserSelection(e.target.value)}
                className="w-full bg-site-stone outline-none h-[4rem] rounded-md px-3 py-2 text-sm placeholder:text-site-gray"
              >
                <option value="all">All Users</option>
                <option value="individual">Individual User</option>
              </select>
            </div>
          </div>
        </div>
        {userType === "individual" && (
          <div className="mt-3 w-full">
            <label className="text-xs text-gray-500 mb-1 block">
              Select Users (Multi Select)
            </label>

            <AsyncSelect
              isMulti
              cacheOptions
              defaultOptions={selectedCustomerOptions}
              value={selectedCustomerOptions}
              loadOptions={loadOptions}
              onChange={(selected: any) => {
                const safeSelected = selected || [];

                setSelectedCustomerOptions(safeSelected);

                setFormData((prev) => ({
                  ...prev,
                  user_name: safeSelected.map((item: any) => ({
                    user_name: item.value,
                  })),
                }));
              }}
              placeholder="Search & select multiple customers"
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "4rem",
                  backgroundColor: "#f5f5f5",
                }),
                option: (base) => ({
                  ...base,
                  fontSize: "14px",
                }),
              }}
            />
          </div>
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-l from-site-neongreen to-site-saffron text-site-black px-6 py-2 rounded-md disabled:opacity-60"
          >
            {submitting
              ? "Saving..."
              : mode === "edit"
              ? "Update Coupon"
              : "Add Coupon"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="border px-6 py-2 rounded-md"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddCoupon;
