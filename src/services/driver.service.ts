import api from '@/lib/axios';
import { DriverJob, DriverJobDTO } from '@/types/driver';

const JOB_ENDPOINT = '/driver/jobs';

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
  const { data } = await api.get<DriverJobDTO[]>(`${JOB_ENDPOINT}/available`);
  return data.map(mapDtoToJob);
};

export const getActiveJob = async (): Promise<DriverJob | null> => {
  try {
    const { data } = await api.get<DriverJobDTO>(`${JOB_ENDPOINT}/active`);
    return mapDtoToJob(data);
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
  await api.post(`${JOB_ENDPOINT}/accept`, { jobId, type: jobType });
};

export const completeJob = async (jobId: string): Promise<void> => {
  await api.post(`${JOB_ENDPOINT}/complete`, { jobId });
};
