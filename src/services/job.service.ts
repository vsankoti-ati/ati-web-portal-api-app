import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOpening } from '../entities/job-opening.entity';
import { Candidate } from '../entities/candidate.entity';
import { JobReferral } from '../entities/job-referral.entity';
import { MockDataService } from './mock-data.service';

@Injectable()
export class JobService {
    constructor(
        @InjectRepository(JobOpening)
        private jobOpeningRepository: Repository<JobOpening>,
        @InjectRepository(Candidate)
        private candidateRepository: Repository<Candidate>,
        @InjectRepository(JobReferral)
        private jobReferralRepository: Repository<JobReferral>,
        private mockDataService: MockDataService,
    ) { }

    async getAllJobOpenings(): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            return this.mockDataService.getMockData('job-openings');
        }
        return this.jobOpeningRepository.find();
    }

    async getJobOpening(id: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const jobs = this.mockDataService.getMockData('job-openings');
            return jobs.find((j) => j.id === id);
        }
        return this.jobOpeningRepository.findOne({ where: { id } });
    }

    async createJobOpening(jobData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const jobs = this.mockDataService.getMockData('job-openings');
            const newJob = { id: `job-${Date.now()}`, ...jobData, created_at: new Date().toISOString() };
            jobs.push(newJob);
            await this.mockDataService.saveMockData('job-openings', jobs);
            return newJob;
        }
        const job = this.jobOpeningRepository.create(jobData);
        return this.jobOpeningRepository.save(job);
    }

    async getAllReferrals(employeeId?: string): Promise<any[]> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const referrals = this.mockDataService.getMockData('job-referrals');
            return employeeId ? referrals.filter((r) => r.referred_by === employeeId) : referrals;
        }
        return employeeId
            ? this.jobReferralRepository.find({ where: { referred_by: employeeId } })
            : this.jobReferralRepository.find();
    }

    async createReferral(referralData: any): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const referrals = this.mockDataService.getMockData('job-referrals');
            const newReferral = {
                id: `ref-${Date.now()}`,
                ...referralData,
                referral_status: 'submitted',
                created_at: new Date().toISOString(),
            };
            referrals.push(newReferral);
            await this.mockDataService.saveMockData('job-referrals', referrals);
            return newReferral;
        }
        const referral = this.jobReferralRepository.create(referralData);
        return this.jobReferralRepository.save(referral);
    }

    async updateReferralStatus(id: string, status: string): Promise<any> {
        if (process.env.USE_MOCK_DATA === 'true') {
            const referrals = this.mockDataService.getMockData('job-referrals');
            const referral = referrals.find((r) => r.id === id);
            if (referral) {
                referral.referral_status = status;
                await this.mockDataService.saveMockData('job-referrals', referrals);
            }
            return referral;
        }
        await this.jobReferralRepository.update(id, { referral_status: status });
        return this.jobReferralRepository.findOne({ where: { id } });
    }
}
