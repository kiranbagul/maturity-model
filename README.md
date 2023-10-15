[DRAFT VERSION]

# Introduction

This is simplified version of The OWASP DevSecOps Maturity Model implementation (https://github.com/devsecopsmaturitymodel/DevSecOps-MaturityModel). 

Goals : 
- Collection of ready to use process templates for mulptiple streams.
- Generic and simplified yaml structure suitable for any problem domain
- UX improvements

Demo : https://www.kiranbagul.com/maturity-model-demo/ (WIP)

# Maturity Model Chart

## Overview

A Maturity Model chart is a valuable tool for assessing and improving organizational processes, capabilities, and performance. It provides a structured framework for understanding the current state, setting goals, and guiding continuous improvement efforts.

## Key Benefits

1. **Assessment and Benchmarking:**
   - Evaluate the organization against industry best practices.
   - Benchmark current processes against recognized standards.

2. **Goal Setting and Roadmap:**
   - Define improvement goals based on maturity levels.
   - Establish a clear roadmap for progression.

3. **Risk Management:**
   - Identify and manage risks associated with processes.
   - Mitigate risks as the organization progresses.

4. **Continuous Improvement:**
   - Embrace the concept of continuous improvement.
   - Evolve processes to adapt to changing business environments.

5. **Resource Allocation:**
   - Allocate resources effectively based on maturity levels.
   - Prioritize areas that require the most improvement.

6. **Communication and Alignment:**
   - Provide a common language for discussing maturity.
   - Foster better communication and alignment of goals.

7. **Decision Support:**
   - Use insights for informed decision-making.
   - Support decisions on investments, process changes, and resource allocations.

8. **Client and Stakeholder Confidence:**
   - Instill confidence by demonstrating commitment to quality.
   - Showcase efficiency and continuous improvement efforts.

9. **Regulatory Compliance:**
   - Demonstrate compliance with industry regulations.
   - Meet and exceed compliance requirements using the structured approach.

10. **Training and Skill Development:**
    - Identify training needs based on maturity levels.
    - Develop skills necessary to advance through stages.

# Usage

```
> npm install
> ng serve
```
Go to http://localhost:4200

## YAML configuration format to be added to src/assets/YAML/generated:
```
Dimension1:
  SubDimension1:
    Activity1:
      level: 1
      tags:
      - none
      teamsImplemented:
        Default: false
    Activity2:
      level: 1
      tags:
      - none
      teamsImplemented:
        Default: false    
    Activity3:
      level: 2
      tags:
      - none
      teamsImplemented:
        Default: false
    Activity4:
      level: 3
      tags:
      - none
      teamsImplemented:
        Default: false
  SubDimension2:
    Activity1:
      level: 1
      tags:
      - none
      teamsImplemented:
        Default: false
    Activity2:
      level: 2
      tags:
      - none
      teamsImplemented:
        Default: true
    Activity3:
      level: 3
      tags:
      - none
      teamsImplemented:
        Default: false
  SubDimension3:
    Activity1:
      level: 1
      tags:
      - none
      teamsImplemented:
        Default: false
    Activity2:
      level: 2
      tags:
      - none
      teamsImplemented:
        Default: false
    Activity3:
      level: 3
      tags:
      - none
      teamsImplemented:
        Default: false
Dimension1:
  SubDimension1:
    Activity1:
      level: 1
      tags:
      - none
      teamsImplemented:
        Default: false
    Activity2:
      level: 2
      tags:
      - none
      teamsImplemented:
        Default: false
    Activity3:
      level: 3
      tags:
      - none
      teamsImplemented:
        Default: false
```

## Todo : 

1. Docker Containerisation 
2. Code simplification and removing redudent code from original repo.
3. Template preparation.

