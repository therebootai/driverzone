"use client";

import ZoneMap from "@/ui/Zonemap";

export default function ZoneManagement({}) {
  const handleZoneCreate = (zone: any) => {};

  const handleZoneDelete = (zone: any) => {};

  const handleZoneUpdate = (zone: any) => {};
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Zone Management
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Draw custom zones on the map to define geographical areas for your
            application
          </p>
        </div>

        {/* Mobile Tabs */}
        <div className="lg:hidden mb-6">
          <div className="border-b border-gray-200">
            {/* <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("map")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "map"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Map View
              </button>
              <button
                onClick={() => setActiveTab("zones")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "zones"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Your Zones ({zones.length})
              </button>
            </nav> */}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Map Section */}
          <div
          // className={`lg:col-span-2 ${
          //   activeTab === "zones" ? "hidden lg:block" : "block"
          // }`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 relative">
                <h2 className="text-xl font-semibold text-gray-900">
                  Zone Map
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={() => checkPointInZone(51.505, -0.09)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    Check Location
                  </button>
                </div>
              </div>

              <ZoneMap
                onZoneCreate={handleZoneCreate}
                onZoneUpdate={handleZoneUpdate}
                onZoneDelete={handleZoneDelete}
                // existingZones={zones}
              />

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-800 mb-2">
                  How to create zones:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Click the polygon tool in the top-right of the map
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Click on the map to create points for your zone
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Double-click or click the first point to complete the zone
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Zones List */}
          {/* <div
            className={`${activeTab === "map" ? "hidden lg:block" : "block"}`}
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <ZoneList
                zones={zones}
                onZoneSelect={setSelectedZone}
                onZoneDelete={handleZoneDelete}
              />
            </div>
          </div> */}
        </div>

        {/* Quick Stats */}
        {/* <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {zones.length}
            </div>
            <div className="text-sm font-medium text-gray-900">Total Zones</div>
            <p className="text-xs text-gray-500 mt-1">
              Active zones in your account
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {totalPoints}
            </div>
            <div className="text-sm font-medium text-gray-900">
              Total Points
            </div>
            <p className="text-xs text-gray-500 mt-1">Across all zones</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {zones.length > 0
                ? new Date(
                    Math.max(
                      ...zones.map((z) => new Date(z.updatedAt).getTime())
                    )
                  ).toLocaleDateString()
                : "Never"}
            </div>
            <div className="text-sm font-medium text-gray-900">
              Last Updated
            </div>
            <p className="text-xs text-gray-500 mt-1">Zone information</p>
          </div>
        </div> */}
      </div>
    </div>
  );
}
