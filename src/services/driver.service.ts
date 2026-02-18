import api from '@/lib/axios';
import { DriverJob, DriverJobDTO } from '@/types/driver';

const JOB_ENDPOINT = '/driver';

// --- Helper ---
const mapDtoToJob = (dto: DriverJobDTO): DriverJob => ({
  id: dto.id,
  orderId: dto.orderNumber,
  type: dto.type,
  status: dto.status,
  customerName: dto.customer.fullName,
  address: dto.address.address,
  itemCount: dto.orderItems.reduce((acc, item) => acc + item.quantity, 0),
  date: new Date(dto.createdAt).toLocaleDateString(),
});

// --- Services ---
export const getAvailableJobs = async (): Promise<DriverJob[]> => {
  const { data } = await api.get<{ data: DriverJobDTO[] }>(`${JOB_ENDPOINT}/available`);
  return data.data.map(mapDtoToJob);
};

export const getActiveJob = async (): Promise<DriverJob | null> => {
  try {
    const { data } = await api.get<{ data: DriverJobDTO }>(`${JOB_ENDPOINT}/active`);
    return mapDtoToJob(data.data);
  } catch (error: any) {
    return error.response?.status === 404 ? null : Promise.reject(error);
  }
};

export const acceptJob = async (jobId: string, type?: string): Promise<void> => {
  let jobType = type;
  if (!jobType) {
    // Smart Lookup if type missing
    const jobs = await getAvailableJobs();
    const target = jobs.find((j) => j.id === jobId);
    if (!target) throw new Error('Job not found');
    jobType = target.type;
  }
  
  const endpoint = jobType === 'PICKUP' 
    ? `${JOB_ENDPOINT}/pickup/accept` 
    : `${JOB_ENDPOINT}/delivery/accept`;

  await api.post(endpoint, { orderId: jobId }); // Backend expects orderId
};

export const completeJob = async (jobId: string, type: string): Promise<void> => {
  const endpoint = type === 'PICKUP' ? `${JOB_ENDPOINT}/pickup/complete` : `${JOB_ENDPOINT}/delivery/complete`;
  await api.post(endpoint, { orderId: jobId }); // Backend expects orderId, not jobId
};

export const getDriverHistory = async (): Promise<DriverJob[]> => {
  const { data } = await api.get<{ data: DriverJobDTO[] }>(`${JOB_ENDPOINT}/history`);
  return data.data.map(mapDtoToJob);
};
