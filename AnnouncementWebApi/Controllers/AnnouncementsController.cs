﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnnouncementWebApi.Models;
using System.Diagnostics;

namespace AnnouncementWebApi.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementsController : ControllerBase
    {
        private readonly AnnouncementContext _context;

        public AnnouncementsController(AnnouncementContext context)
        {
            _context = context;
        }

        // GET: api/Announcements
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetAnnouncements()
        {
          if (_context.Announcements == null)
          {
              return NotFound();
          }
            return await _context.Announcements.ToListAsync();
        }

        // GET: api/Announcements/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Announcement>> GetAnnouncement(int id)
        {
          if (_context.Announcements == null)
          {
              return NotFound();
          }
            var announcement = await _context.Announcements.FindAsync(id);

            if (announcement == null)
            {
                return NotFound();
            }

            return announcement;
        }

        // PUT: api/Announcements/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutAnnouncement(int id, Announcement announcement)
        {
            if (id != announcement.Id)
            {
                return BadRequest();
            }

            _context.Entry(announcement).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!AnnouncementExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // GET: api/Announcements/top3/id
        [HttpGet("top3/{id}")]
        public async Task<ActionResult<IEnumerable<Announcement>>> GetTopThreeSimilarAnnouncements(int id)
        {
            var selectedAnnouncement = await _context.Announcements.FindAsync(id);

            if (selectedAnnouncement == null)
            {
                return NotFound(); 
            }

            var announcements = await _context.Announcements.ToListAsync();

            // Filter announcements based on similarity
            var similarAnnouncements = FindSimilarAnnouncements(selectedAnnouncement, announcements);

            // Select top 3
            var sortedAnnouncements = similarAnnouncements.Take(3);

            return Ok(sortedAnnouncements);
        }

        private IEnumerable<Announcement> FindSimilarAnnouncements(Announcement selectedAnnouncement, IEnumerable<Announcement> announcements)
        {

            // Check if there are any other announcements that share at least one word in title or description
            var similarAnnouncements = announcements.Where(a =>
                a.Id != selectedAnnouncement.Id &&
                (a.Title.Split(' ', StringSplitOptions.RemoveEmptyEntries).Intersect(selectedAnnouncement.Title.Split(' ')).Any() ||
                a.Description.Split(' ', StringSplitOptions.RemoveEmptyEntries).Intersect(selectedAnnouncement.Description.Split(' ')).Any()))
                .ToList();

            return similarAnnouncements;
        }

        // POST: api/Announcements
        [HttpPost]
        public async Task<ActionResult<Announcement>> PostAnnouncement(Announcement announcement)
        {
            if (_context.Announcements == null)
            {
                return Problem("Entity set 'AnnouncementContext.Announcements'  is null.");
            }

            Console.WriteLine(announcement);
            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAnnouncement), new { id = announcement.Id }, announcement);
        }

        // DELETE api/announcements/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnnouncement(int id)
        {
            if (_context.Announcements == null)
            {
                return NotFound();
            }
            var announcement = await _context.Announcements.FindAsync(id);
            if (announcement == null)
            {
                return NotFound();
            }

            _context.Announcements.Remove(announcement);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool AnnouncementExists(int id)
        {
            return (_context.Announcements?.Any(e => e.Id == id)).GetValueOrDefault();
        }
    }
}
