import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../layout/AdminLayout';
import { Dashboard } from './Dashboard';
import { ShipmentManagement } from '../shipments/ShipmentManagement';
import { LocationsManagement } from '../rates/LocationsManagement';
import { ZonesManagement } from '../rates/ZonesManagement';
import { ShippingRatesManagement } from '../rates/ShippingRatesManagement';
import { PickupRatesManagement } from '../rates/PickupRatesManagement';
import { MapSettings } from '../settings/MapSettings';
import { GeneralSettings } from '../settings/GeneralSettings';
import { CustomFieldsManager } from '../settings/CustomFieldsManager';
import { UserManagement } from '../users/UserManagement';
import { ReportsManagement } from '../reports/ReportsManagement';
import { InvoicesManagement } from '../invoices/InvoicesManagement';
import { InternationalManagement } from '../international/InternationalManagement';
import { DeliveriesManagement } from '../deliveries/DeliveriesManagement';
export const AdminDashboard: React.FC = () => {
  return <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="shipments" element={<ShipmentManagement />} />
        <Route path="rates/locations" element={<LocationsManagement />} />
        <Route path="rates/zones" element={<ZonesManagement />} />
        <Route path="rates/shipping" element={<ShippingRatesManagement />} />
        <Route path="rates/pickup" element={<PickupRatesManagement />} />
        <Route path="reports" element={<ReportsManagement />} />
        <Route path="invoices" element={<InvoicesManagement />} />
        <Route path="international" element={<InternationalManagement />} />
        <Route path="deliveries" element={<DeliveriesManagement />} />
        <Route path="map-settings" element={<MapSettings />} />
        <Route path="settings/general" element={<GeneralSettings />} />
        <Route path="settings/custom-fields" element={<CustomFieldsManager />} />
        <Route path="users" element={<UserManagement />} />
      </Route>
    </Routes>;
};