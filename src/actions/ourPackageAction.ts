"use server";
import { ensureModelsRegistered } from "@/db/connection";
import Package from "@/models/Packages";

/**
 * Fetches unique packages for the home page.
 * Returns only 1 package per package_type, limited to 3 types.
 */
export async function GET_HOME_PACKAGES() {
  try {
    await ensureModelsRegistered();

    const packages = await Package.find({ status: true })
      .sort({ total_price: 1 })
      .lean();

    const uniquePackages: any[] = [];
    const typesSeen = new Set<string>();

    for (const pkg of packages) {
      if (!typesSeen.has(pkg.package_type)) {
        uniquePackages.push(pkg);
        typesSeen.add(pkg.package_type);
      }
      if (uniquePackages.length === 3) break;
    }

    return JSON.parse(JSON.stringify(uniquePackages));
  } catch (error) {
    console.error("Error fetching home packages:", error);
    return [];
  }
}

/**
 * Fetches all active packages.
 */
export async function GET_ALL_PACKAGES() {
  try {
    await ensureModelsRegistered();
    const packages = await Package.find({ status: true })
      .sort({ total_price: 1 })
      .lean();
    return JSON.parse(JSON.stringify(packages));
  } catch (error) {
    console.error("Error fetching all packages:", error);
    return [];
  }
}

/**
 * Fetches unique package types.
 */
export async function GET_PACKAGE_TYPES() {
  try {
    await ensureModelsRegistered();
    const packages = await Package.find({ status: true })
      .sort({ total_price: 1 })
      .lean();
    const uniquePackages: any[] = [];
    const typesSeen = new Set<string>();
    for (const pkg of packages) {
      if (!typesSeen.has(pkg.package_type)) {
        uniquePackages.push(pkg);
        typesSeen.add(pkg.package_type);
      }
    }
    return JSON.parse(JSON.stringify(uniquePackages));
  } catch (error) {
    console.error("Error fetching package types:", error);
    return [];
  }
}

/**
 * Fetches packages by their type.
 */
export async function GET_PACKAGES_BY_TYPE(type: string) {
  try {
    await ensureModelsRegistered();
    const packages = await Package.find({ status: true, package_type: type })
      .sort({ total_price: 1 })
      .lean();
    return JSON.parse(JSON.stringify(packages));
  } catch (error) {
    console.error("Error fetching packages by type:", error);
    return [];
  }
}
