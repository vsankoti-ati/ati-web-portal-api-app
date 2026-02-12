import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JobOpening } from '../entities/job-opening.entity';
import { Candidate } from '../entities/candidate.entity';
import { JobReferral } from '../entities/job-referral.entity';

@Injectable()
export class JobService {
    constructor(
        @InjectRepository(JobOpening)
        private jobOpeningRepository: Repository<JobOpening>,
        @InjectRepository(Candidate)
        private candidateRepository: Repository<Candidate>,
        @InjectRepository(JobReferral)
        private jobReferralRepository: Repository<JobReferral>,
    ) { }

    async getAllJobOpenings(): Promise<any[]> {
        return this.jobOpeningRepository.find();
    }

    async getJobOpening(id: string): Promise<any> {
        return this.jobOpeningRepository.findOne({ where: { id } });
    }

    async createJobOpening(jobData: any): Promise<any> {
        const job = this.jobOpeningRepository.create(jobData);
        return this.jobOpeningRepository.save(job);
    }

    async getAllReferrals(employeeId?: string): Promise<any[]> {
        return employeeId
            ? this.jobReferralRepository.find({ where: { referred_by: employeeId } })
            : this.jobReferralRepository.find();
    }

    async createReferral(referralData: any): Promise<any> {
        const referral = this.jobReferralRepository.create(referralData);
        return this.jobReferralRepository.save(referral);
    }

    async updateReferralStatus(id: string, status: string): Promise<any> {
        await this.jobReferralRepository.update(id, { referral_status: status });
        return this.jobReferralRepository.findOne({ where: { id } });
    }
}
