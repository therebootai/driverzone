"use client";

import { ADD_PACKAGE } from "@/actions/packageAction";
import { GET_ALL_ZONES } from "@/actions/zoneActions";
import { PackageDocument } from "@/models/Packages";
import { ZoneDocument } from "@/models/Zones";
import BasicInput from "@/ui/BasicInput";
import BasicSelectWithLabel from "@/ui/BasicSelectWithLabel";
import { convertTime } from "@/utils/timeConversion";
import {
  ChangeEvent,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

export default function PackageForm({
  update_package,
  onClose,
}: {
  update_package?: PackageDocument;
  onClose?: () => void;
}) {
  const isEdit = !!update_package;

  // UTILITY STATE
  const [searchedZones, setSearchedZones] = useState<ZoneDocument[]>([]);
  const [mainSearchInput, setMainSearchInput] = useState<string>("");
  const [serviceSearchInput, setServiceSearchInput] = useState<string>("");
  const [showMainZone, setShowMainZone] = useState<boolean>(false);
  const [showServiceZone, setShowServiceZone] = useState<boolean>(false);

  // INPUT STATE
  const [name, setName] = useState<string>(update_package?.name || "");
  const [destination, setDestination] = useState<string>(
    update_package?.destination || ""
  );
  const [package_type, setPackageType] = useState<string>(
    update_package?.package_type || "city_tour"
  );
  const [duration, setDuration] = useState<string>("");
  const [company_charge, setCompanyCharge] = useState<number>(
    update_package?.company_charge || 399
  );
  const [driver_charge, setDriverCharge] = useState<number>(
    update_package?.driver_charge || 350
  );
  const [fooding_charge, setFoodingCharge] = useState<number>(
    update_package?.fooding_charge || 150
  );
  const [over_time_customer_charge, setOverTimeCustomerCharge] =
    useState<number>(update_package?.over_time_customer_charge || 1.65);
  const [over_time_driver_charge, setOverTimeDriverCharge] = useState<number>(
    update_package?.over_time_driver_charge || 1
  );
  const [early_morning_charge, setEarlyMorningCharge] = useState<number>(
    update_package?.early_morning_charge || 0
  );
  const [late_night_charge, setLateNightCharge] = useState<number>(
    update_package?.late_night_charge || 0
  );
  const [total_price, setTotalPrice] = useState<number>(
    update_package?.total_price || company_charge + driver_charge
  );
  const [main_zone, setMainZone] = useState<any>(
    update_package?.main_zone || undefined
  );
  const [service_zone, setServiceZone] = useState<any>(
    update_package?.service_zone || undefined
  );
  const [discount_type, setDiscountType] = useState<string>(
    update_package?.discount_type || "none"
  );
  const [discount, setDiscount] = useState<number>(
    update_package?.discount || 0
  );

  // UTILITY FUNCTION
  const handleSearchZones = async (
    e: ChangeEvent<HTMLInputElement>,
    onChangeFunc: (value: string) => void
  ) => {
    try {
      const search = e.target.value.trim();

      onChangeFunc(search);

      if (search === "") {
        setSearchedZones([]);
        return;
      }

      const { data } = await GET_ALL_ZONES({ limit: 12, search });

      setSearchedZones(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddNewZone = async (prevState: any, formData: FormData) => {
    try {
      const payload: {
        name: string;
        destination: string;
        package_type:
          | "city_tour"
          | "mini_outstation"
          | "outstation"
          | "hills_tour"
          | "long_tour"
          | "drop_pickup_service";
        duration: number;
        company_charge: number;
        driver_charge: number;
        fooding_charge: number;
        over_time_customer_charge: number;
        over_time_driver_charge: number;
        early_morning_charge: number;
        late_night_charge: number;
        total_price: number;
        main_zone?: string;
        service_zone?: string;
        discount_type: "percentage" | "fixed" | "none";
        discount: number;
      } = {
        name,
        destination,
        package_type:
          package_type === "city_tour" ||
          package_type === "outstation" ||
          package_type === "mini_outstation" ||
          package_type === "hills_tour" ||
          package_type === "long_tour" ||
          package_type === "drop_pickup_service"
            ? package_type
            : "city_tour",
        duration: convertTime(duration, "toHours").value,
        company_charge,
        driver_charge,
        fooding_charge,
        over_time_customer_charge,
        over_time_driver_charge,
        early_morning_charge,
        late_night_charge,
        total_price,
        main_zone: main_zone ? main_zone._id : undefined,
        service_zone: service_zone ? service_zone._id : undefined,
        discount_type:
          discount_type === "percentage" ||
          discount_type === "fixed" ||
          discount_type === "none"
            ? discount_type
            : "none",
        discount,
      };

      if (isEdit) {
        // await update_package?.update_package(payload);
      } else {
        await ADD_PACKAGE(payload);
      }
      toast.success("Package added successfully");
      onClose && onClose();
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const calculateTotalPrice = useCallback(() => {
    let total = company_charge + driver_charge + fooding_charge;
    if (discount_type === "fixed") {
      total -= discount;
    } else if (discount_type === "percentage") {
      total -= (total * discount) / 100;
    }
    setTotalPrice(total);
  }, [company_charge, driver_charge, fooding_charge, discount_type, discount]);

  useEffect(() => {
    calculateTotalPrice();
  }, [calculateTotalPrice]);

  const [state, formAction, isPending] = useActionState(handleAddNewZone, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <BasicInput
        placeholder="Package Name"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <BasicInput
        placeholder="Package Destination"
        name="destination"
        type="text"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <BasicInput
          placeholder="Package Duration"
          name="duration"
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <span className="text-xs font-medium text-site-gray">
          For hours end with &quot;H&quot; &amp; for days end with &quot;D&quot;
          eg: 2H or 3D
        </span>
      </div>
      <BasicSelectWithLabel
        label="Package Type"
        name="package_type"
        value={package_type}
        onChange={(e) => setPackageType(e.target.value)}
        opts={[
          {
            label: "City Tour",
            value: "city_tour",
          },
          {
            label: "Mini Outstation",
            value: "mini_outstation",
          },
          {
            label: "Outstation",
            value: "outstation",
          },
          {
            label: "Hills Tour",
            value: "hills_tour",
          },
          {
            label: "Long Tour",
            value: "long_tour",
          },
          {
            label: "Drop & Pickup Service",
            value: "drop_pickup_service",
          },
        ]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <BasicInput
          label="Company Charge"
          placeholder="Company Charge"
          name="company_charge"
          type="number"
          value={company_charge}
          onChange={(e) => setCompanyCharge(Number(e.target.value))}
        />
        <BasicInput
          label="Driver Charge"
          placeholder="Driver Charge"
          name="driver_charge"
          type="number"
          value={driver_charge}
          onChange={(e) => setDriverCharge(Number(e.target.value))}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <BasicInput
          label="Fooding Charge"
          placeholder="Fooding Charge"
          name="fooding_charge"
          type="number"
          value={fooding_charge}
          onChange={(e) => setFoodingCharge(Number(e.target.value))}
        />
        <BasicInput
          label="Over Time Customer Charge"
          placeholder="Over Time Customer Charge"
          name="over_time_customer_charge"
          type="number"
          value={over_time_customer_charge}
          onChange={(e) => setOverTimeCustomerCharge(Number(e.target.value))}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <BasicInput
          label="Late Night Charge"
          placeholder="Late Night Charge"
          name="late_night_charge"
          type="number"
          value={late_night_charge}
          onChange={(e) => setLateNightCharge(Number(e.target.value))}
        />
        <BasicInput
          label="Early Morning Charge"
          placeholder="Early Morning Charge"
          name="early_morning_charge"
          type="number"
          value={early_morning_charge}
          onChange={(e) => setEarlyMorningCharge(Number(e.target.value))}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <BasicInput
          label="Over Time Driver Charge"
          placeholder="Over Time Driver Charge"
          name="over_time_driver_charge"
          type="number"
          value={over_time_driver_charge}
          onChange={(e) => setOverTimeDriverCharge(Number(e.target.value))}
        />
        <BasicInput
          label="Total Price"
          placeholder="Total Price"
          name="total_price"
          type="number"
          value={total_price}
          readOnly
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div className="flex flex-col gap-1.5 relative group">
          <BasicInput
            label="Main Booking Zone"
            placeholder="Search Zone by name or destination"
            value={mainSearchInput}
            onChange={(e) => {
              handleSearchZones(e, setMainSearchInput);
              setShowMainZone(true);
            }}
          />
          {searchedZones.length > 0 && showMainZone && (
            <div className="absolute top-full my-3.5 left-0 px-3 py-2 rounded-lg border border-site-gray/50 flex flex-col w-full bg-white z-10">
              {searchedZones.map((zone, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setMainZone(zone);
                    setMainSearchInput(zone.name);
                    setSearchedZones([]);
                    setShowMainZone(false);
                  }}
                  className="px-2 py-1 cursor-pointer hover:bg-site-gray/50 not-last:border-b border-site-gray/60"
                >
                  {zone.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5 relative group">
          <BasicInput
            label="Service Booking Zone"
            placeholder="Search Zone by name or destination"
            value={serviceSearchInput}
            onChange={(e) => {
              handleSearchZones(e, setServiceSearchInput);
              setShowServiceZone(true);
            }}
          />
          {searchedZones.length > 0 && showServiceZone && (
            <div className="absolute top-full my-3.5 left-0 px-3 py-2 rounded-lg border border-site-gray/50 flex flex-col w-full bg-white z-10">
              {searchedZones.map((zone, index) => (
                <div
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    setServiceZone(zone);
                    setSearchedZones([]);
                    setServiceSearchInput(zone.name);
                    setShowServiceZone(false);
                  }}
                  className="px-2 py-1 cursor-pointer hover:bg-site-gray/50 not-last:border-b border-site-gray/60"
                >
                  {zone.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <BasicSelectWithLabel
          label="Discount Type"
          name="discount_type"
          value={discount_type}
          onChange={(e) => setDiscountType(e.target.value)}
          opts={[
            {
              label: "None",
              value: "none",
            },
            {
              label: "Fixed",
              value: "fixed",
            },
            {
              label: "Percentage",
              value: "percentage",
            },
          ]}
        />
        <BasicInput
          placeholder="Discount Value"
          label="Discount Value"
          name="discount"
          type="number"
          value={discount}
          onChange={(e) => setDiscount(Number(e.target.value))}
        />
      </div>
      <button
        type="submit"
        className="text-site-black bg-linear-90 from-site-saffron to-site-skin py-2 px-6 self-start rounded font-medium"
      >
        {isPending ? "Wait" : "Submit"}
      </button>
    </form>
  );
}
