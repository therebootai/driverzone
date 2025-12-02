"use client";

import BasicInput from "@/ui/BasicInput";

export default function PackageForm() {
  return (
    <form action="" className="flex flex-col gap-4">
      <BasicInput placeholder="Package Name" name="name" type="text" />
      <BasicInput
        placeholder="Package Destination"
        name="destination"
        type="text"
      />
    </form>
  );
}
