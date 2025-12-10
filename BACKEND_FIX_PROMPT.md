# Fix Backend Roadmap Service - toggleStepCompletion Method

## Issue
The `toggleStepCompletion` method in the roadmap service is returning a `RoadmapStep` object instead of a `Roadmap` object, causing GraphQL to fail with "Cannot return null for non-nullable field Roadmap.desktopId" because the resolver expects a `Roadmap` but receives a `RoadmapStep`.

## Current Code (Problematic)
```typescript
async toggleStepCompletion(stepId: number, userId: number) {
  const step = await this.prisma.roadmapStep.findFirst({
    where: {
      id: stepId,
      roadmap: { userId },
    },
  });
  if (!step) {
    throw new NotFoundException('Roadmap step not found');
  }
  return this.prisma.roadmapStep.update({
    where: { id: stepId },
    data: { isCompleted: !step.isCompleted },
    include: {
      roadmap: {
        include: {
          steps: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
}
```

## Fixed Code
```typescript
async toggleStepCompletion(stepId: number, userId: number) {
  const step = await this.prisma.roadmapStep.findFirst({
    where: {
      id: stepId,
      roadmap: { userId },
    },
  });
  if (!step) {
    throw new NotFoundException('Roadmap step not found');
  }
  const updatedStep = await this.prisma.roadmapStep.update({
    where: { id: stepId },
    data: { isCompleted: !step.isCompleted },
    include: {
      roadmap: {
        include: {
          steps: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });
  return updatedStep.roadmap;
}
```

## Explanation
The method was returning the `RoadmapStep` object directly, but the GraphQL resolver expects a `Roadmap` object. The fix stores the updated step in a variable and returns `updatedStep.roadmap`, which is the `Roadmap` object with all its steps included (ordered by `order: 'asc'`).

## Alternative Approach (More Efficient)
If you want to avoid the nested include, you could also fetch the roadmap directly after updating:

```typescript
async toggleStepCompletion(stepId: number, userId: number) {
  const step = await this.prisma.roadmapStep.findFirst({
    where: {
      id: stepId,
      roadmap: { userId },
    },
    include: {
      roadmap: true,
    },
  });
  if (!step) {
    throw new NotFoundException('Roadmap step not found');
  }
  
  await this.prisma.roadmapStep.update({
    where: { id: stepId },
    data: { isCompleted: !step.isCompleted },
  });
  
  return this.prisma.roadmap.findUnique({
    where: { id: step.roadmapId },
    include: {
      steps: {
        orderBy: { order: 'asc' },
      },
    },
  });
}
```

However, the first fix (returning `updatedStep.roadmap`) is simpler and maintains the same query structure.

